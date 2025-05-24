import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import hanuLogo from "../assets/images/logo.png";
import authService from "../services/authService";
import { useAuthContext } from "../contexts/AuthContext";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuthContext();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Kiểm tra nếu username hoặc password trống
      if (!username.trim()) {
        setError("Vui lòng nhập tên đăng nhập");
        setLoading(false);
        return;
      }

      if (!password) {
        setError("Vui lòng nhập mật khẩu");
        setLoading(false);
        return;
      }

      const response = await authService.login(username, password);
      login(username, password);

      if (rememberMe) {
        // Store the remember me preference
        localStorage.setItem("rememberMe", "true");
      }

      // Redirect based on user role
      navigate(response.redirectTo);
    } catch (err) {
      console.error("Login error:", err);

      // Hiển thị thông báo lỗi cụ thể từ server
      if (err.response?.data?.error_code === "USER_NOT_FOUND") {
        setError("Tài khoản không tồn tại. Vui lòng kiểm tra lại.");
      } else if (err.response?.data?.error_code === "INVALID_PASSWORD") {
        setError("Mật khẩu không chính xác. Vui lòng thử lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin đăng nhập."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay">
        <div className="login-header">
          <div className="login-logo">
            <img src={hanuLogo} alt="HANU Logo" />
            <div className="logo-text">
              <div className="logo-text-small">Bộ Giáo dục và Đào tạo</div>
              <div className="logo-text-large">
                TRƯỜNG ĐẠI HỌC QUẢN LÝ VÀ CÔNG NGHỆ HẢI PHÒNG
              </div>
            </div>
          </div>
        </div>
        <div className="container-content-login">
          <div className="login-welcome">
            <h2>
              Chào mừng Bạn đến với{" "}
              <span className="highlight">DỊCH VỤ MỘT CỔNG</span>,
            </h2>
            <p>
              Trường Đại học Quản lý và Công nghệ Hải Phòng là nơi chắp cánh cho
              bao thế hệ sinh viên với khát vọng tri thức và sáng tạo. HPU
               ra đời như một mái nhà chung trong kỷ nguyên số, nơi{" "}
              <span className="highlight">Sinh viên - Cựu sinh viên</span> có
              thể kết nối, chia sẻ và cùng nhau kiến tạo những giá trị bền vững
              cho cộng đồng HPU.
            </p>
            <p className="signature">- HPU 2025 -</p>
          </div>

          <div className="login-form-container">
            <div className="login-form-box">
              <h2 className="login-form-title">ĐĂNG NHẬP</h2>

              {error && (
                <div
                  className="error-message"
                  style={{
                    backgroundColor: "#ffebee",
                    color: "#d32f2f",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    border: "1px solid #ef9a9a",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Mã ID</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Mã ID | Số điện thoại | Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* <div className="form-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Tự động đăng nhập</span>
                  </label>
                  <span className="help-text">Cần trợ giúp?</span>
                </div>

                <div className="forgot-password">
                  <a href="/forgot-password">Quên mật khẩu</a>
                </div> */}

                <div className="form-group">
                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
