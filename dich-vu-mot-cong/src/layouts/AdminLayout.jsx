import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "../styles/AdminLayout.css";

const Sidebar = ({ isCollapsed, isMobileOpen, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <div
      className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="admin-sidebar-header">
        <h2>Quản trị viên</h2>
        <p>Hệ thống Dịch vụ Một cửa</p>
      </div>

      <nav className="admin-sidebar-nav">
        <Link
          to="/admin"
          className={`${
            isActive("/admin") && location.pathname === "/admin" ? "active" : ""
          }`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Tổng quan</span>
        </Link>
        <Link
          to="/admin/departments"
          className={isActive("/admin/departments")}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">Khoa/Phòng ban</span>
        </Link>
        <Link
          to="/admin/form-templates"
          className={isActive("/admin/form-templates")}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">Mẫu biểu</span>
        </Link>
        <Link to="/admin/users" className={isActive("/admin/users")}>
          <span className="nav-icon">👥</span>
          <span className="nav-text">Người dùng</span>
        </Link>

        <Link onClick={onLogout} className={isActive("/admin/logout")}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Đăng xuất</span>
        </Link>
      </nav>
    </div>
  );
};

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onLogout={handleLogout}
      />

      {/* Overlay for mobile */}
      <div
        className={`admin-overlay ${isMobileOpen ? "active" : ""}`}
        onClick={toggleMobileSidebar}
      ></div>

      <div className={`admin-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-toggle-btn"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  toggleMobileSidebar();
                } else {
                  toggleSidebar();
                }
              }}
            >
              ☰
            </button>
            <h1 className="admin-header-title">
              {location.pathname === "/admin"
                ? "Tổng quan"
                : location.pathname.includes("/admin/departments")
                ? "Quản lý Khoa/Phòng ban"
                : location.pathname.includes("/admin/form-templates")
                ? "Quản lý Mẫu biểu"
                : location.pathname.includes("/admin/users")
                ? "Quản lý Người dùng"
                : location.pathname.includes("/admin/settings")
                ? "Cài đặt hệ thống"
                : "Quản trị hệ thống"}
            </h1>
          </div>

          <div className="admin-header-right">
            <span className="admin-user-info">
              {user?.full_name || user?.username}
            </span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
