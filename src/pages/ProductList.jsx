import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  deleteProduct,
} from "../features/products/productSlice";
import Product from "../components/Product";
import { toast } from "react-toastify";
import styles from "./ProductList.module.css";
import AddProductModal from "../components/AddProductModal";
import { useAuth } from "../context/AuthProvider";
import EditProductModal from "../components/EditProductModal";

function ProductList() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.product);
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);
  useEffect(() => {
    checkExpiredProducts();
    const interval = setInterval(checkExpiredProducts, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [items]);

  const checkExpiredProducts = () => {
    const today = new Date().toLocaleDateString("en-CA");
    const expiredProducts = items?.filter((product) => {
      if (!product.expiryDate) return false;
      return new Date(product.expiryDate) < new Date(today);
    });

    if (expiredProducts?.length > 0) {
      expiredProducts.forEach((product) => {
        dispatch(deleteProduct(product.id));
      });
      toast.info(`${expiredProducts.length} expired products removed.`);
    }
  };

  const filteredProducts = items?.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );
  // console.log("filteredProducts", filteredProducts);

  const handleEdit = async (product) => {
    if (!currentUser || currentUser.id !== product.ownerId) {
      toast.error("You are not authorized to edit this product.");
      return;
    }
    setEditingProduct(product);
  };

  const handleDelete = async (productId) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete products.");
      return;
    }
    const product = items.find((prod) => prod.id === productId);

    if (product && product.ownerId !== currentUser.id) {
      toast.error("You are not authorized to delete this product.");
      return;
    }
    try {
      await dispatch(deleteProduct(productId));
      toast.success("Product deleted successfully.");
    } catch (error) {
      toast.error("Error deleting product.");
    }
  };

  const toggleAddProductModal = () => {
    setShowAddProductModal(!showAddProductModal);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={toggleAddProductModal}>
          Add Product
        </button>
      </div>

      <input
        type="text"
        className={styles.search}
        placeholder="Search by name or category"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.grid}>
        {filteredProducts?.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts?.map((product) => (
            <Product
              key={product.id}
              product={product}
              currentUser={currentUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showAddProductModal && (
        <AddProductModal onClose={toggleAddProductModal} />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

export default ProductList;
