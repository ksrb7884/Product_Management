import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/users/userSlice";
import { AuthContext, useAuth } from "../context/AuthProvider";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const { login } = useAuth(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(loginUser(formData));
      const { payload, error } = response;

      if (payload) {
        login(payload);
        navigate("/products", { replace: true });
      } else {
        console.error("Login failed:", error?.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Something went wrong:", err.message);
    }
  };
  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
