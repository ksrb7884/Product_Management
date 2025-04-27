import React, { useState } from "react";
import styles from "./Signup.module.css";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../features/users/userSlice";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = formData;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signupUser(formData))
      .unwrap()
      .then(() => navigate("/login"))
      .catch(() => {});
  };
  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <form action="">
        <input
          className={styles.input}
          type="text"
          name="name"
          placeholder="Name"
          value={name}
          onChange={handleChange}
        />
        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
        />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
        />
        <button className={styles.button} onClick={handleSubmit}>
          Sign Up
        </button>
      </form>
      <div style={{ textAlign: "center", margin: "1rem" }}>
        or <Link to="/login">Signin</Link>
      </div>
    </div>
  );
}

export default Signup;
