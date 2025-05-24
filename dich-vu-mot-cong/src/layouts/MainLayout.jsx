import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import hanuLogo from "../assets/images/logo.png"; // Reuse the logo
import "../styles/MainLayout.css";
import { useAuthContext } from "../contexts/AuthContext";
const MainLayout = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="main-header">
        <div className="header-logo">
          <img src={hanuLogo} alt="HANU Logo" style={{ marginRight: "20px" }} />
          <div className="logo-text">
            <div className="logo-text-small">Bộ Giáo dục và Đào tạo</div>
            <div className="logo-text-large">
              TRƯỜNG ĐẠI HỌC QUẢN LÝ VÀ CÔNG NGHỆ HẢI PHÒNG
            </div>
          </div>
        </div>

        {/* Thêm menu điều hướng */}
        <nav className="main-nav">
          <Link to="/home" className="nav-link">
            Hồ sơ/ Thủ tục
          </Link>
          {/* <Link to="/home/hoso" className="nav-link">
            Hồ sơ / Thủ tục
          </Link> */}
          <Link to="/home/xuly" className="nav-link">
            Xử lý
          </Link>
        </nav>

        <div className="header-right">
          <div className="user-profile">
            <span>{user?.full_name}</span>
            <Link to="/login" onClick={handleLogout} className="logout-btn">
              Đăng Xuất
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="main-container">
        {/* Sidebar */}
        {/* <aside className="sidebar">
          <nav>
            <ul>
              <li>
                <Link to="/khoa">Không gian Khoa</Link>
              </li>
              <li>
                <Link to="/phong-ban">Phòng/Ban/Trung tâm</Link>
              </li>
              <li>
                <Link to="/khong-gian">Không gian</Link>
              </li>
              <li>
                <Link to="/kham-pha">Khám phá</Link>
              </li>
              <li>
                <Link to="/cv-online">CV Online</Link>
              </li>
              <li>
                <Link to="/khong-gian-ban">Không gian Bản sư</Link>
              </li>
              <li>
                <Link to="/co-hoi-viec-lam">Cơ hội việc làm</Link>
              </li>
              <li>
                <Link to="/khoa-nghiep">Khởi nghiệp Đổi mới</Link>
              </li>
              <li>
                <Link to="/solidarity">Solidarity</Link>
              </li>
              <li>
                <Link to="/huong-dan">Hướng dẫn sử dụng</Link>
              </li>
              <li>
                <Link to="/su-kien">Sự kiện SV Online</Link>
              </li>
              <li>
                <Link to="/co-ban-hoc-tap">Cơ bản học tập</Link>
              </li>
              <li>
                <Link to="/quan-diem">Quản Điểm rèn luyện</Link>
              </li>
              <li>
                <Link to="/hanu-connections">HANU Connections</Link>
              </li>
            </ul>
          </nav>
        </aside> */}

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
