import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Card,
  Typography,
  message,
  Spin,
  Space,
  Breadcrumb,
  Divider,
  Alert,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import formTemplateService from "../../services/formTemplateService";
import departmentService from "../../services/departmentService";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const StaffFormTemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [htmlPreview, setHtmlPreview] = useState(null);
  const isEditMode = !!id;

  useEffect(() => {
    fetchDepartments();
    if (isEditMode) {
      fetchFormTemplate();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      message.error("Không thể tải danh sách phòng ban");
    }
  };

  const fetchFormTemplate = async () => {
    try {
      setInitialLoading(true);
      const data = await formTemplateService.getFormTemplateById(id);
      form.setFieldsValue({
        title: data.title,
        category: data.category,
        department_id: data.department_id.toString(),
      });

      // Nếu có HTML content, hiển thị xem trước
      if (data.html_content) {
        setHtmlPreview(data.html_content);
      }

      // Nếu có file URL, hiển thị link tải xuống
      if (data.file_url) {
        setPreviewUrl(data.file_url);
      }
    } catch (err) {
      console.error("Error fetching form template:", err);
      message.error("Không thể tải thông tin mẫu biểu");
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("category", values.category || "");
      formData.append("department_id", values.department_id);

      if (fileList.length > 0) {
        formData.append("file", fileList[0].originFileObj);
      }

      if (isEditMode) {
        await formTemplateService.updateFormTemplate(id, formData);
        message.success("Cập nhật mẫu biểu thành công");
      } else {
        await formTemplateService.createFormTemplate(formData);
        message.success("Thêm mẫu biểu mới thành công");
      }
      navigate("/admin/form-templates");
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} form template:`,
        err
      );
      message.error(
        `Không thể ${
          isEditMode ? "cập nhật" : "thêm"
        } mẫu biểu. Vui lòng thử lại sau.`
      );
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file) => {
    const isDocx =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isDocx) {
      message.error("Chỉ chấp nhận file .docx!");
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Kích thước file không được vượt quá 10MB!");
    }

    return isDocx && isLt10M;
  };

  const handleChange = ({ fileList }) => setFileList(fileList);

  return (
    <div className="form-template-form">
      <Breadcrumb
        items={[
          { title: "Trang chủ" },
          { title: "Quản trị" },
          {
            title: (
              <a onClick={() => navigate("/admin/form-templates")}>Mẫu biểu</a>
            ),
          },
          { title: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
        className="mb-4"
      />

      <Card bordered={false}>
        <Title level={4} className="mb-4">
          {isEditMode ? "Chỉnh sửa mẫu biểu" : "Thêm mẫu biểu mới"}
        </Title>
        <Divider />

        {initialLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark="optional"
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tiêu đề mẫu biểu",
                },
              ]}
            >
              <Input placeholder="Nhập tiêu đề mẫu biểu" />
            </Form.Item>

            <Form.Item name="category" label="Danh mục">
              <Input placeholder="Nhập danh mục (không bắt buộc)" />
            </Form.Item>

            <Form.Item
              name="department_id"
              label="Phòng ban"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phòng ban",
                },
              ]}
            >
              <Select placeholder="Chọn phòng ban">
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="file"
              label="File mẫu biểu"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                {
                  required: !isEditMode,
                  message: "Vui lòng tải lên file mẫu biểu",
                },
              ]}
              extra="Chỉ chấp nhận file .docx, kích thước tối đa 10MB"
            >
              <Upload
                name="file"
                listType="text"
                maxCount={1}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                customRequest={({ onSuccess }) =>
                  setTimeout(() => onSuccess("ok"), 0)
                }
              >
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>

            {previewUrl && (
              <Form.Item label="File hiện tại">
                <Space>
                  <FileTextOutlined />
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tải xuống file
                  </a>
                </Space>
              </Form.Item>
            )}

            {htmlPreview && (
              <Form.Item label="Xem trước HTML">
                <div className="border rounded-md p-4 max-h-60 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                </div>
                <div className="mt-2">
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      navigate(`/admin/form-templates/${id}/preview`)
                    }
                  >
                    Xem đầy đủ
                  </Button>
                </div>
              </Form.Item>
            )}

            {isEditMode && !fileList.length && (
              <Alert
                message="Lưu ý"
                description="Nếu bạn không tải lên file mới, hệ thống sẽ giữ nguyên file hiện tại."
                type="info"
                showIcon
                className="mb-4"
              />
            )}

            <Form.Item className="mb-0">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  {isEditMode ? "Cập nhật" : "Thêm mới"}
                </Button>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/admin/form-templates")}
                >
                  Quay lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default StaffFormTemplateForm;
