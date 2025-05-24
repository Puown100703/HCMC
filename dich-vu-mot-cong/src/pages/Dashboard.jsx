import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "staff") {
        navigate("/staff");
      } else if (user.role === "student") {
        navigate("/student");
      }
    }
  }, [user, navigate]);

  // If no user or redirection hasn't happened yet, show loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Đang chuyển hướng...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default Dashboard;
