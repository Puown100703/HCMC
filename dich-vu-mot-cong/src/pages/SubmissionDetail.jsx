import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Descriptions,
  Breadcrumb,
  Divider,
  Space,
  Tag,
  message,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import submittedFormService from "../services/submittedFormService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "../styles/SubmissionDetail.css";

const { Title, Text } = Typography;

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const data = await submittedFormService.getSubmittedFormById(id);
      setSubmission(data);
    } catch (err) {
      console.error("Error fetching submission:", err);
      message.error("Không thể tải thông tin hồ sơ");
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="error-container">
        <Text type="danger">Không tìm thấy thông tin hồ sơ</Text>
        <Button type="primary" onClick={() => navigate("/xuly")}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="submission-detail-container">
      {/* <Breadcrumb
        className="mb-4"
        items={[
          { title: "Trang chủ", href: "/home" },
          { title: "Theo dõi xử lý", href: "/home/xuly" },
          { title: `Hồ sơ #${submission.id}` },
        ]}
      /> */}

      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/home/xuly")}
        className="mb-4"
      >
        Quay lại danh sách
      </Button>

      <Card className="submission-detail-card">
        <Title level={2}>
          Chi tiết hồ sơ:{" "}
          {submission.FormTemplate?.title || `#${submission.id}`}
        </Title>

        <Descriptions
          bordered
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Mẫu biểu" span={2}>
            <Space>
              <FileTextOutlined />
              <span>{submission.FormTemplate?.title || "—"}</span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {getStatusTag(submission.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Phòng ban xử lý">
            <Space>
              <BankOutlined />
              <span>{submission.Department?.name || "—"}</span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Người xử lý">
            <Space>
              <UserOutlined />
              <span>
                {submission.assignedStaff?.full_name ||
                  submission.assignedStaff?.username ||
                  "Chưa phân công"}
              </span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày nộp">
            <Space>
              <CalendarOutlined />
              <span>
                {submission.submitted_at
                  ? format(
                      new Date(submission.submitted_at),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: vi,
                      }
                    )
                  : "—"}
              </span>
            </Space>
          </Descriptions.Item>

          {submission.processed_date && (
            <Descriptions.Item label="Ngày xử lý">
              <Space>
                <CalendarOutlined />
                <span>
                  {format(
                    new Date(submission.processed_date),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: vi,
                    }
                  )}
                </span>
              </Space>
            </Descriptions.Item>
          )}

          {submission.feedback && (
            <Descriptions.Item label="Phản hồi" span={3}>
              <div className="feedback-container">
                <div className="feedback-header">
                  <Avatar icon={<UserOutlined />} />
                  <div className="feedback-info">
                    <div className="feedback-author">
                      {submission.assignedStaff?.full_name ||
                        submission.assignedStaff?.username ||
                        "Nhân viên xử lý"}
                    </div>
                    {submission.processed_date && (
                      <div className="feedback-time">
                        {format(
                          new Date(submission.processed_date),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: vi,
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="feedback-content">{submission.feedback}</div>
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left">Nội dung đơn</Divider>

        {submission.html_content ? (
          <Card className="mt-4 submission-content">
            <div
              dangerouslySetInnerHTML={{ __html: submission.html_content }}
            />
          </Card>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có nội dung HTML
          </div>
        )}
      </Card>
    </div>
  );
};

export default SubmissionDetail;
