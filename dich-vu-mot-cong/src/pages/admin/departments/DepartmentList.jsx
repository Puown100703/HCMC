import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Space,
  Popconfirm,
  Card,
  Typography,
  message,
  Tag,
  Tooltip,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import departmentService from "../../../services/departmentService";

const { Title } = Typography;

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      message.error("Không thể tải danh sách phòng ban. Vui lòng thử lại sau.");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await departmentService.deleteDepartment(id);
      setDepartments(departments.filter((dept) => dept.id !== id));
      message.success("Xóa phòng ban thành công");
    } catch (err) {
      message.error("Không thể xóa phòng ban. Vui lòng thử lại sau.");
      console.error("Error deleting department:", err);
    }
  };

  const columns = [
    {
      title: "Tên phòng ban",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Link
          to={`/admin/departments/${record.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {text}
        </Link>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          String(record.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.code).toLowerCase().includes(value.toLowerCase()) ||
          String(record.description).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    // {
    //   title: "Mã phòng ban",
    //   dataIndex: "code",
    //   key: "code",
    //   sorter: (a, b) => a.code.localeCompare(b.code),
    // },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description || "Không có mô tả"}>
          <span>{description || "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Số lượng nhân viên",
      dataIndex: "staff_count",
      key: "staff_count",
      sorter: (a, b) => (a.staff_count || 0) - (b.staff_count || 0),
      render: (count) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count || 0}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/departments/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa phòng ban"
            description="Bạn có chắc chắn muốn xóa phòng ban này?"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="department-list">
      <Card bordered={false}>
        <div className="flex justify-between items-center mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/departments/new")}
          >
            Thêm phòng ban mới
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm phòng ban..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={departments.map((dept) => ({ ...dept, key: dept.id }))}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng số ${total} phòng ban`,
          }}
        />
      </Card>
    </div>
  );
};

export default DepartmentList;
