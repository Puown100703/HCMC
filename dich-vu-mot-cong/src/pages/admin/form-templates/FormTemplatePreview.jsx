import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Breadcrumb,
  Space,
  Tag,
  message,
} from "antd";
import {
  EditOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  BankOutlined,
} from "@ant-design/icons";
import formTemplateService from "../../../services/formTemplateService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "../../../styles/FormTemplatePreview.css";

const { Title } = Typography;

const FormTemplatePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormTemplate();
  }, [id]);

  const fetchFormTemplate = async () => {
    try {
      setLoading(true);
      const data = await formTemplateService.getFormTemplateById(id);
      console.log(data);
      setTemplate(data);
    } catch (err) {
      console.error("Error fetching form template:", err);
      message.error("Không thể tải thông tin mẫu biểu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-8">
        <p>Không tìm thấy mẫu biểu</p>
        <Button
          type="primary"
          onClick={() => navigate("/admin/form-templates")}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="form-template-preview">
      <Card
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="m-0">
              Xem trước mẫu biểu
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/form-templates/${id}`)}
              >
                Chỉnh sửa
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/form-templates")}
              >
                Quay lại
              </Button>
            </Space>
          </div>
        }
        bordered={false}
      >
        <div className="template-preview-container">
          {/* Cột bên trái - Thông tin chung */}
          <div className="template-info-column">
            <Card title="Thông tin chung" className="info-card">
              <div className="info-item">
                <div className="info-label">Tiêu đề:</div>
                <div className="info-content">
                  <Space>
                    <FileTextOutlined />
                    <span>{template.title}</span>
                  </Space>
                </div>
              </div>

              {/* <div className="info-item">
                <div className="info-label">Danh mục:</div>
                <div className="info-content">
                  {template.category ? (
                    <Tag icon={<TagOutlined />} color="blue">
                      {template.category}
                    </Tag>
                  ) : (
                    "—"
                  )}
                </div>
              </div> */}

              <div className="info-item">
                <div className="info-label">Phòng ban:</div>
                <div className="info-content">
                  <Tag icon={<BankOutlined />} color="green">
                    {template.Department?.name ||
                      `Phòng ban #${template.department_id}`}
                  </Tag>
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">Người tạo:</div>
                <div className="info-content">
                  <Space>
                    <UserOutlined />
                    <span>
                      {template.uploader?.full_name ||
                        template.uploader?.username ||
                        "—"}
                    </span>
                  </Space>
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">Ngày tạo:</div>
                <div className="info-content">
                  <Space>
                    <CalendarOutlined />
                    <span>
                      {template.created_at
                        ? format(
                            new Date(template.created_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )
                        : "—"}
                    </span>
                  </Space>
                </div>
              </div>

              {/* {template.file_url && (
                <div className="info-item">
                  <div className="info-label">File gốc:</div>
                  <div className="info-content">
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      href={template.file_url}
                      target="_blank"
                    >
                      Tải xuống file DOCX
                    </Button>
                  </div>
                </div>
              )} */}
            </Card>
          </div>

          {/* Cột bên phải - Nội dung HTML */}
          <div className="template-content-column">
            <Card title="Nội dung mẫu đơn" className="content-card">
              {template.html_content ? (
                <div className="form-template-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: template.html_content }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có nội dung HTML
                </div>
              )}
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FormTemplatePreview;
