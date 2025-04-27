import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default AuthRedirect;
