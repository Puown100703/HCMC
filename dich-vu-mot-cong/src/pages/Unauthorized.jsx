import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

const Unauthorized = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Truy cập bị từ chối
        </h1>
        <p className="text-gray-600 mb-8">
          Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ
          quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Quay lại trang chủ
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
