import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { updateProduct } from "../features/products/productSlice";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthProvider";
import styles from "./EditProductModal.module.css";

function EditProductModal({ product, onClose }) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const [productData, setProductData] = useState({
    ...product,
    price: Number(product.price),
  });
  const [priceError, setPriceError] = useState("");
  const [lastUpdatedToday, setLastUpdatedToday] = useState(false);
  const [isPriceModified, setIsPriceModified] = useState(false);

  useEffect(() => {
    const lastUpdate = localStorage.getItem(`lastPriceUpdate_${product.id}`);
    if (lastUpdate) {
      const lastUpdateDate = new Date(lastUpdate);
      const today = new Date();
      setLastUpdatedToday(
        lastUpdateDate.getDate() === today.getDate() &&
          lastUpdateDate.getMonth() === today.getMonth() &&
          lastUpdateDate.getFullYear() === today.getFullYear()
      );
    }
  }, [product.price]);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });

    if (e.target.name === "price") {
      setIsPriceModified(true);

      const newPrice = Number(e.target.value);
      const currentPrice = Number(product.price);
      const minPrice = currentPrice * 0.9;
      const maxPrice = currentPrice * 1.1;

      if (isNaN(newPrice)) {
        setPriceError("Please enter a valid number");
      } else if (newPrice < minPrice || newPrice > maxPrice) {
        setPriceError(`Price must be between ${minPrice} and ${maxPrice}`);
      } else {
        setPriceError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || currentUser.id !== product.ownerId) {
      toast.error("You are not authorized to edit this product.");
      return;
    }

    if (isPriceModified) {
      if (priceError) {
        toast.error(priceError);
        return;
      }

      if (lastUpdatedToday) {
        toast.error("You can only update the price once per day.");
        return;
      }
    }

    try {
      await dispatch(updateProduct({ id: product.id, product: productData }));

      if (isPriceModified) {
        localStorage.setItem(
          `lastPriceUpdate_${product.id}`,
          new Date().toLocaleDateString()
        );
      }

      toast.success("Product updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  const shouldDisableButton =
    isPriceModified && (priceError || lastUpdatedToday);

  const modalContent = (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <h3>Edit Product</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={productData.category}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
            />
            {priceError && <p className={styles.error}>{priceError}</p>}
            {isPriceModified && lastUpdatedToday && (
              <p className={styles.warning}>
                Price already updated today. You can update again tomorrow.
              </p>
            )}
          </div>
          <div>
            <label>Expiry Date:</label>
            <input
              type="date"
              name="expiryDate"
              value={productData.expiryDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <button type="submit" disabled={shouldDisableButton}>
              Update Product
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById("modal-root"));
}

export default EditProductModal;
