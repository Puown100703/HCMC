import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Space,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import userService from "../../../services/userService";
import departmentService from "../../../services/departmentService";

const { Option } = Select;
const { confirm } = Modal;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, departmentsData] = await Promise.all([
          userService.getAllUsers(),
          departmentService.getAllDepartments(),
        ]);
        setUsers(usersData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const confirmDelete = (user) => {
    confirm({
      title: `Xác nhận xóa`,
      content: `Bạn có chắc chắn muốn xóa người dùng "${user.username}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        handleDelete(user.id);
      },
      onCancel() {},
    });
  };

  const handleDelete = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      message.success("Đã xóa người dùng thành công");
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Không thể xóa người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
  };

  const handleDepartmentFilter = (value) => {
    setFilterDepartment(value);
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "Không có";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.student_id &&
        user.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole ? user.role === filterRole : true;
    const matchesDepartment = filterDepartment
      ? user.department_id === parseInt(filterDepartment)
      : true;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  const showModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        student_id: user.student_id || "",
        department_id: user.department_id || "",
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const userData = { ...values };
      if (!userData.password) delete userData.password;

      if (modalMode === "edit") {
        await userService.updateUser(selectedUser.id, userData);
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, ...userData } : user
          )
        );
        message.success("Cập nhật người dùng thành công");
      } else {
        const newUser = await userService.createUser(userData);
        setUsers([...users, newUser]);
        message.success("Tạo người dùng mới thành công");
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error saving user:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể lưu thông tin người dùng. Vui lòng thử lại sau."
      );
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <>
          {text}
          {record.student_id && (
            <div style={{ fontSize: 12, color: "#666" }}>
              MSSV: {record.student_id}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "green";
        if (role === "admin") color = "red";
        else if (role === "staff") color = "blue";
        return (
          <Tag color={color}>
            {role === "admin"
              ? "Quản trị viên"
              : role === "staff"
              ? "Nhân viên"
              : "Sinh viên"}
          </Tag>
        );
      },
    },
    {
      title: "Khoa/Phòng ban",
      dataIndex: "department_id",
      key: "department_id",
      render: (departmentId) => getDepartmentName(departmentId),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => showModal("edit", record)}
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            onClick={() => confirmDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal("add")}
          >
            Thêm người dùng
          </Button>
        </div>
        <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Tất cả vai trò"
            value={filterRole}
            onChange={handleRoleFilter}
            style={{ width: 200 }}
          >
            <Option value="">Tất cả vai trò</Option>
            <Option value="admin">Quản trị viên</Option>
            <Option value="staff">Nhân viên</Option>
            <Option value="student">Sinh viên</Option>
          </Select>
          <Select
            placeholder="Tất cả Khoa/Phòng ban"
            value={filterDepartment}
            onChange={handleDepartmentFilter}
            style={{ width: 300 }}
          >
            <Option value="">Tất cả Khoa/Phòng ban</Option>
            {departments.map((dept) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>Đang tải...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            Không tìm thấy người dùng nào.
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers.map((user) => ({
              ...user,
              key: user.id,
            }))}
            pagination={{ pageSize: 10 }}
            loading={loading}
            scroll={{ x: 1000 }}
          />
        )}
      </div>

      <Modal
        title={
          modalMode === "add" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" initialValues={{ role: "student" }}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input disabled={modalMode === "edit"} />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
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
            <Select>
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
                      new Error("Mã sinh viên là bắt buộc đối với sinh viên!")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Khoa/Phòng ban" name="department_id">
            <Select placeholder="-- Chọn Khoa/Phòng ban --">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              modalMode === "add"
                ? { required: true, message: "Vui lòng nhập mật khẩu!" }
                : {},
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
            extra={
              modalMode === "edit"
                ? "Để trống nếu không muốn thay đổi mật khẩu."
                : null
            }
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
