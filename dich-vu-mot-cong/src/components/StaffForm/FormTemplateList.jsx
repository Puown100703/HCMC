import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
  Spin,
  Form,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import formTemplateService from "../../services/formTemplateService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthContext } from "../../contexts/AuthContext";
const { Title } = Typography;
const { Option } = Select;

const StaffFormTemplateList = () => {
  const [formTemplates, setFormTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  useEffect(() => {
    fetchFormTemplates();
  }, []);

  const fetchFormTemplates = async () => {
    try {
      setLoading(true);
      console.log("user", user);
      const data = await formTemplateService.getFormTemplatesByDepartment(
        user?.department_id
      );
      setFormTemplates(data);
    } catch (err) {
      message.error("Không thể tải danh sách mẫu biểu. Vui lòng thử lại sau.");
      console.error("Error fetching form templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await formTemplateService.deleteFormTemplate(id);
      setFormTemplates(formTemplates.filter((t) => t.id !== id));
      message.success(`Đã xóa mẫu biểu "${title}"`);
    } catch (err) {
      message.error("Không thể xóa mẫu biểu. Vui lòng thử lại sau.");
      console.error("Error deleting form template:", err);
    }
  };

  // Lấy danh sách các category duy nhất
  const categories = [...new Set(formTemplates.map((t) => t.category))].filter(
    Boolean
  );

  // Lấy danh sách các department duy nhất
  const departments = [
    ...new Set(
      formTemplates.map((t) => ({
        id: t.department_id,
        name: t.department?.name || `Phòng ban #${t.department_id}`,
      }))
    ),
  ];

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <a
            onClick={() =>
              navigate(`/staff/form-templates/${record.id}/preview`)
            }
          >
            {text}
          </a>
        </Space>
      ),
      filteredValue: searchTerm ? [searchTerm] : null,
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    // {
    //   title: "Danh mục",
    //   dataIndex: "category",
    //   key: "category",
    //   render: (category) => category || "—",
    //   filteredValue: filterCategory ? [filterCategory] : null,
    //   onFilter: (value, record) => record.category === value,
    // },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      render: (_, record) =>
        record.Department?.name || `Phòng ban #${record.department_id}`,
      filteredValue: filterDepartment ? [filterDepartment] : null,
      onFilter: (value, record) => record.department_id.toString() === value,
    },
    {
      title: "Người tạo",
      dataIndex: "uploader",
      key: "uploader",
      render: (_, record) =>
        record.uploader?.full_name || record.uploader?.username || "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) =>
        date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi }) : "—",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem trước">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() =>
                navigate(`/staff/form-templates/${record.id}/preview`)
              }
            />
          </Tooltip>
          {/* <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/staff/form-templates/${record.id}`)}
            />
          </Tooltip> */}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa mẫu biểu"
              description={`Bạn có chắc chắn muốn xóa mẫu biểu "${record.title}"?`}
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => handleDelete(record.id, record.title)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="form-template-list">
      {/* <Breadcrumb
        items={[
          { title: "Trang chủ" },
          { title: "Quản trị" },
          { title: "Mẫu biểu" },
        ]}
        className="mb-4"
      /> */}

      <Card bordered={false}>
        {/* <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">
            Quản lý mẫu biểu
          </Title>
          
        </div> */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/staff/form-templates/new")}
        >
          Thêm mẫu biểu mới
        </Button>
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item label="Tìm kiếm theo tiêu đề">
                <Input
                  placeholder="Tìm kiếm theo tiêu đề..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            {/* <Col xs={24} sm={8}>
              <Form.Item label="Lọc theo danh mục">
                <Select
                  placeholder="Lọc theo danh mục"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {categories.map((category, index) => (
                    <Option key={index} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
            {/* <Col xs={24} sm={8}>
              <Form.Item label="Lọc theo phòng ban">
                <Select
                  placeholder="Lọc theo phòng ban"
                  value={filterDepartment}
                  onChange={setFilterDepartment}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={formTemplates.map((template) => ({
            ...template,
            key: template.id,
          }))}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng số ${total} mẫu biểu`,
          }}
          locale={{
            emptyText: (
              <div className="text-center py-8 text-gray-500">
                <div>Không tìm thấy mẫu biểu nào</div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default StaffFormTemplateList;
