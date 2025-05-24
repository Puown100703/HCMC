import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  message,
  Tooltip,
  Empty,
  Breadcrumb,
  Alert,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BankOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import submittedFormService from "../services/submittedFormService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "../styles/ProcessingStatus.css";
import { useAuthContext } from "../contexts/AuthContext";

const { Title, Text } = Typography;

const ProcessingStatus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSubmissions();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem hồ sơ của bạn");
    }
  }, [isAuthenticated]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submittedFormService.getSubmittedFormsByStudent();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      if (err.response && err.response.status === 403) {
        setError("Bạn không có quyền truy cập vào trang này");
      } else if (err.message === "User not found or missing ID") {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại");
      } else {
        setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại sau.");
      }
      message.error("Không thể tải danh sách hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Đang chờ xử lý
          </Tag>
        );
      case "approved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "processing":
        return (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            Đang xử lý
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Mẫu biểu",
      dataIndex: "FormTemplate",
      key: "formTemplate",
      render: (formTemplate) => (
        <Space>
          <FileTextOutlined />
          <span>{formTemplate?.title || "—"}</span>
        </Space>
      ),
    },
    {
      title: "Phòng ban xử lý",
      dataIndex: "Department",
      key: "department",
      render: (department) => (
        <Space>
          <BankOutlined />
          <span>{department?.name || "—"}</span>
        </Space>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) =>
        date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi }) : "—",
      sorter: (a, b) =>
        new Date(a.submission_date) - new Date(b.submission_date),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Đang chờ xử lý", value: "pending" },
        { text: "Đang xử lý", value: "processing" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Người xử lý",
      dataIndex: "assignedStaff",
      key: "assignedStaff",
      render: (staff) =>
        staff ? (
          <Space>
            <UserOutlined />
            <span>{staff.full_name || staff.username || "—"}</span>
          </Space>
        ) : (
          "Chưa phân công"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/home/submissions/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="processing-status-container">
      {/* <Breadcrumb
        className="mb-4"
        items={[
          { title: "Trang chủ", href: "/home" },
          { title: "Theo dõi xử lý" },
        ]}
      /> */}

      <Card className="processing-status-card">
        <Title level={2}>Theo dõi tình trạng xử lý hồ sơ</Title>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="error-container">
            <Alert
              message="Lỗi"
              description={
                <div>
                  <Text type="danger">{error}</Text>
                  {!isAuthenticated() && (
                    <div className="mt-4">
                      <Button
                        type="primary"
                        icon={<LoginOutlined />}
                        onClick={() => navigate("/login")}
                      >
                        Đăng nhập
                      </Button>
                    </div>
                  )}
                </div>
              }
              type="error"
              showIcon
            />
          </div>
        ) : submissions.length > 0 ? (
          <Table
            columns={columns}
            dataSource={submissions.map((submission) => ({
              ...submission,
              key: submission.id,
            }))}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Tổng số ${total} hồ sơ`,
            }}
          />
        ) : (
          <Empty
            description="Bạn chưa có hồ sơ nào được gửi"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default ProcessingStatus;
