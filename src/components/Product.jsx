import React from "react";
import styles from "./Product.module.css";

function Product({ product, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.title}>{product.name}</div>
        <div className={styles.category}>{product.category}</div>
        <div className={styles.price}>₹{product.price}</div>
        <div className={styles.expiry}>
          Expires: {new Date(product.expiryDate).toLocaleString()}
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.edit}`}
            onClick={() => onEdit(product)}
          >
            Edit
          </button>
          <button
            className={`${styles.button} ${styles.delete}`}
            onClick={() => onDelete(product.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Product;
