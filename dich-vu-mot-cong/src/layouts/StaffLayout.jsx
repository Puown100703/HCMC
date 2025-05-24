import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "../styles/StaffLayout.css";

const Sidebar = ({ isCollapsed, isMobileOpen, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <div
      className={`staff-sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="staff-sidebar-header">
        <h2>Cán bộ</h2>
        <p>Hệ thống Dịch vụ Một cửa</p>
      </div>

      <nav className="staff-sidebar-nav">
        <Link
          to="/staff"
          className={`${
            isActive("/staff") && location.pathname === "/staff" ? "active" : ""
          }`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Tổng quan</span>
        </Link>
        <Link to="/staff/requests" className={isActive("/staff/requests")}>
          <span className="nav-icon">📬</span>
          <span className="nav-text">Yêu cầu sinh viên</span>
        </Link>
        <Link to="/staff/form" className={isActive("/staff/form")}>
          <span className="nav-icon">📝</span>
          <span className="nav-text">Thủ tục hành chính</span>
        </Link>
        {/* <Link
          to="/staff/notifications"
          className={isActive("/staff/notifications")}
        >
          <span className="nav-icon">🔔</span>
          <span className="nav-text">Thông báo</span>
        </Link> */}
        <Link onClick={onLogout} className={isActive("/staff/logout")}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Đăng xuất</span>
        </Link>
      </nav>
    </div>
  );
};

const StaffLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="staff-layout">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onLogout={handleLogout}
      />

      <div
        className={`staff-overlay ${isMobileOpen ? "active" : ""}`}
        onClick={toggleMobileSidebar}
      ></div>

      <div className={`staff-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <header className="staff-header">
          <div className="staff-header-left">
            <button
              className="staff-toggle-btn"
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
            <h1 className="staff-header-title">
              {location.pathname === "/staff"
                ? "Tổng quan"
                : location.pathname.includes("/staff/requests")
                ? "Quản lý Yêu cầu"
                : location.pathname.includes("/staff/form")
                ? "Quản lý Thủ tục"
                : location.pathname.includes("/staff/notifications")
                ? "Quản lý Thông báo"
                : "Hệ thống Cán bộ"}
            </h1>
          </div>

          <div className="staff-header-right">
            <span className="staff-user-info">
              {user?.full_name || user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="staff-logout uppmobile-btn"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="staff-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
