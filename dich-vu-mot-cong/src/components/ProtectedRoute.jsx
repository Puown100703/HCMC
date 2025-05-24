import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ requiredRoles = [], redirectPath = "/login" }) => {
  const { isAuthenticated, hasRole, loading } = useAuthContext();

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if the user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if roles are required and if the user has the required role
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user is authenticated and has the required role, render the children
  return <Outlet />;
};

export default ProtectedRoute;
