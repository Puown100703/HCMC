import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Spin,
  Typography,
  Divider,
} from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import userService from "../../../services/userService";
import departmentService from "../../../services/departmentService";

const { Title } = Typography;
const { Option } = Select;

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [form] = Form.useForm();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordPlaceholder, setPasswordPlaceholder] = useState(
    isEditMode ? "••••••••" : ""
  );
  const [currentRole, setCurrentRole] = useState("student"); // Mặc định là student

  useEffect(() => {
    fetchDepartments();
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error(
        "Không thể tải danh sách Khoa/Phòng ban. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserById(id);
      // Cập nhật form và state
      const role = data.role || "student";
      setCurrentRole(role);

      form.setFieldsValue({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        role: role,
        student_id: data.student_id || "",
        department_id: data.department_id || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      message.error(
        "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const userData = { ...values };

      // Xử lý mật khẩu
      if (!userData.password) {
        delete userData.password;
      } else {
        // Đảm bảo mật khẩu có ít nhất 6 ký tự
        if (userData.password.length < 6) {
          message.error("Mật khẩu phải có ít nhất 6 ký tự!");
          setLoading(false);
          return;
        }

        // Kiểm tra xác nhận mật khẩu
        if (userData.password !== userData.confirmPassword) {
          message.error("Mật khẩu xác nhận không khớp!");
          setLoading(false);
          return;
        }
      }

      // Xóa trường confirmPassword vì không cần gửi lên server
      delete userData.confirmPassword;

      // Xử lý student_id và department_id dựa trên role
      if (userData.role === "student") {
        // Nếu là sinh viên
        if (!userData.student_id) {
          // Nếu không có student_id, hiển thị lỗi
          message.error("Mã sinh viên là bắt buộc đối với sinh viên!");
          setLoading(false);
          return;
        }
        // Đặt department_id thành null cho sinh viên
        userData.department_id = null;
      } else {
        // Nếu không phải sinh viên
        userData.student_id = null;

        // Kiểm tra department_id cho nhân viên và admin
        if (
          !userData.department_id &&
          (userData.role === "staff" || userData.role === "admin")
        ) {
          message.error("Vui lòng chọn phòng ban cho nhân viên/quản trị viên!");
          setLoading(false);
          return;
        }
      }

      console.log("Dữ liệu gửi đi:", userData); // Log để debug

      if (isEditMode) {
        await userService.updateUser(id, userData);
        message.success("Cập nhật người dùng thành công!");
      } else {
        await userService.createUser(userData);
        message.success("Tạo người dùng mới thành công!");
      }

      // Chuyển hướng về trang danh sách người dùng sau khi thành công
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (error) {
      console.error("Error saving user:", error);

      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response?.data?.details) {
        message.error(error.response.data.details);
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error(
          "Không thể lưu thông tin người dùng. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        {isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      </Title>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              username: "",
              password: "",
              confirmPassword: "",
              email: "",
              full_name: "",
              role: "student",
              student_id: "",
              department_id: "",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input disabled={isEditMode} />
              </Form.Item>

              <Form.Item
                label="Họ và tên"
                name="full_name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select
                  onChange={(value) => {
                    // Cập nhật state để UI phản ánh đúng role
                    setCurrentRole(value);

                    if (value === "student") {
                      // Nếu vai trò là sinh viên, xóa giá trị department_id
                      form.setFieldsValue({
                        student_id: form.getFieldValue("student_id") || "",
                        department_id: null,
                      });
                    } else {
                      // Nếu vai trò không phải là sinh viên, xóa giá trị student_id
                      form.setFieldsValue({ student_id: "" });
                    }
                    // Cập nhật form để kích hoạt lại validation và UI
                    form.validateFields(["student_id", "department_id"]);
                  }}
                >
                  <Option value="student">Sinh viên</Option>
                  <Option value="staff">Nhân viên</Option>
                  <Option value="admin">Quản trị viên</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Mã sinh viên"
                name="student_id"
                dependencies={["role"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("role") === "student" && !value) {
                        return Promise.reject(
                          new Error(
                            "Mã sinh viên là bắt buộc đối với sinh viên!"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                tooltip="Mã sinh viên chỉ bắt buộc đối với tài khoản sinh viên"
              >
                <Input
                  placeholder="Nhập mã sinh viên"
                  disabled={currentRole !== "student"}
                  onChange={(e) => {
                    // Tự động chuyển đổi thành chữ hoa
                    form.setFieldsValue({
                      student_id: e.target.value.toUpperCase(),
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Khoa/Phòng ban"
                name="department_id"
                dependencies={["role"]}
                tooltip={
                  currentRole === "student"
                    ? "Sinh viên không cần chọn phòng ban"
                    : "Chọn phòng ban cho nhân viên/quản trị viên"
                }
              >
                <Select
                  placeholder={
                    currentRole === "student"
                      ? "Không áp dụng cho sinh viên"
                      : "-- Chọn Khoa/Phòng ban --"
                  }
                  disabled={currentRole === "student"}
                  allowClear={currentRole !== "student"}
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Divider orientation="left">
              {isEditMode ? "Thay đổi mật khẩu" : "Mật khẩu"}
            </Divider>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  !isEditMode
                    ? { required: true, message: "Vui lòng nhập mật khẩu!" }
                    : {},
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <div>
                  {isEditMode && (
                    <div
                      style={{
                        marginBottom: 10,
                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: 4,
                          color: "#1890ff",
                        }}
                      >
                        Mật khẩu hiện tại:
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Input
                          value="Mật khẩu đã được mã hóa"
                          disabled
                          style={{
                            width: "100%",
                            backgroundColor: "#f0f0f0",
                            color: "#666",
                          }}
                        />
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            message.info(
                              "Không thể hiển thị mật khẩu gốc vì đã được mã hóa bảo mật"
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  <Input.Password
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    visibilityToggle={{
                      visible: showPassword,
                      onVisibleChange: togglePasswordVisibility,
                    }}
                    placeholder={
                      isEditMode
                        ? "Nhập mật khẩu mới (nếu muốn thay đổi)"
                        : "Nhập mật khẩu"
                    }
                  />

                  {isEditMode && (
                    <div style={{ marginTop: 8, color: "#1890ff" }}>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        Lưu ý:
                      </div>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li>Mật khẩu đã được mã hóa trong cơ sở dữ liệu</li>
                        <li>Để trống nếu không muốn thay đổi mật khẩu</li>
                        <li>Nhập mật khẩu mới nếu muốn thay đổi</li>
                      </ul>
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  !isEditMode
                    ? { required: true, message: "Vui lòng xác nhận mật khẩu!" }
                    : {},
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        (getFieldValue("password") || !isEditMode) &&
                        value !== getFieldValue("password")
                      ) {
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  visibilityToggle={{
                    visible: showPassword,
                    onVisibleChange: togglePasswordVisibility,
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => navigate("/admin/users")}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default UserForm;
