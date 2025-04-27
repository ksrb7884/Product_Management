import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { addProduct } from "../features/products/productSlice";
import { toast } from "react-toastify";
import styles from "./AddProductModal.module.css";
import { useAuth } from "../context/AuthProvider";

function AddProductModal({ onClose }) {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    price: "",
    expiryDate: "",
  });

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !productData.name ||
      !productData.category ||
      !productData.price ||
      !productData.expiryDate
    ) {
      toast.error("Please fill all fields.");
      return;
    }
    const newProduct = {
      ...productData,
      ownerId: currentUser.id,
    };


    try {
      await dispatch(addProduct(newProduct));
      toast.success("Product added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add product.");
    }
  };

  const modalContent = (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>
          {/* x */}
          &times;
        </span>
        <h3>Add Product</h3>
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
            <button type="submit">Add Product</button>
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

export default AddProductModal;
