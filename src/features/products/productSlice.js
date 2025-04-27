import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3001/products";

const canUpdatePriceToday = (productId) => {
  const lastUpdate = localStorage.getItem(`lastPriceUpdate_${productId}`);
  if (!lastUpdate) return true;

  const today = new Date().toISOString().split("T")[0];
  return lastUpdate !== today;
};

const isPriceInValidRange = (oldPrice, newPrice) => {
  const minPrice = oldPrice * 0.9;
  const maxPrice = oldPrice * 1.1;
  return newPrice >= minPrice && newPrice <= maxPrice;
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await axios.get(API_URL);

    const today = new Date().toLocaleDateString("en-CA");

    const validProducts = response.data.filter((product) => {
      return !product.expiryDate || product.expiryDate >= today;
    });

    if (validProducts.length < response.data.length) {
      const expiredIds = response.data
        .filter((product) => product.expiryDate && product.expiryDate < today)
        .map((product) => product.id);

      // console.log("expiredIds", expiredIds);
      await Promise.all(
        expiredIds.map((id) => axios.delete(`${API_URL}/${id}`))
      );
    }

    return validProducts;
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product) => {
    // console.log(typeof product.price);
    const productToAdd = {
      ...product,
      price: Number(product.price),
    };
    const response = await axios.post(API_URL, productToAdd);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, product }, { getState }) => {
    const state = getState();
    const currentProduct = state.product.items.find((p) => p.id === id);

    if (!currentProduct) {
      throw new Error("Product not found");
    }

    const oldPrice = Number(currentProduct.price);
    const newPrice = Number(product.price);

    const isPriceChanged = newPrice !== oldPrice;

    if (isPriceChanged) {
      if (!isPriceInValidRange(oldPrice, newPrice)) {
        throw new Error(
          `Price must be between ${oldPrice * 0.9} and ${oldPrice * 1.1}`
        );
      }

      if (!canUpdatePriceToday(id)) {
        throw new Error("You can only update the price once per day.");
      }

      localStorage.setItem(
        `lastPriceUpdate_${id}`,
        new Date().toISOString().split("T")[0]
      );
    }

    const response = await axios.put(`${API_URL}/${id}`, product);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    localStorage.removeItem(`lastPriceUpdate_${id}`);
    return id;
  }
);

export const removeExpiredProducts = createAsyncThunk(
  "products/removeExpiredProducts",
  async (_, { dispatch }) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(API_URL);

    const expiredProducts = res.data.filter(
      (product) => product.expiryDate && product.expiryDate < today
    );

    if (expiredProducts.length > 0) {
      // Delete all expired products
      await Promise.all(
        expiredProducts.map((product) =>
          axios.delete(`${API_URL}/${product.id}`)
        )
      );

      // Return the IDs of expired products for state update
      return expiredProducts.map((product) => product.id);
    }

    return [];
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(removeExpiredProducts.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => !action.payload.includes(p.id));
      });
  },
});

export default productSlice.reducer;
