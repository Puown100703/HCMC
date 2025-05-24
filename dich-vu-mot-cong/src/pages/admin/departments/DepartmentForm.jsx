import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Space,
  Breadcrumb,
  Divider,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import departmentService from "../../../services/departmentService";

const { Title } = Typography;
const { TextArea } = Input;

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchDepartment();
    }
  }, [id]);

  const fetchDepartment = async () => {
    try {
      setInitialLoading(true);
      const data = await departmentService.getDepartmentById(id);
      form.setFieldsValue({
        name: data.name,
        code: data.code,
        description: data.description,
      });
    } catch (err) {
      message.error("Không thể tải thông tin phòng ban. Vui lòng thử lại sau.");
      console.error("Error fetching department:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (isEditMode) {
        await departmentService.updateDepartment(id, values);
        message.success("Cập nhật phòng ban thành công");
      } else {
        await departmentService.createDepartment(values);
        message.success("Thêm phòng ban mới thành công");
      }
      navigate("/admin/departments");
    } catch (err) {
      message.error(
        `Không thể ${
          isEditMode ? "cập nhật" : "thêm"
        } phòng ban. Vui lòng thử lại sau.`
      );
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} department:`,
        err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="department-form">
      <Card bordered={false}>
        <Title level={4} className="mb-4">
          {isEditMode ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
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
              name="name"
              label="Tên phòng ban"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên phòng ban",
                },
              ]}
            >
              <Input placeholder="Nhập tên phòng ban" />
            </Form.Item>

            {/* <Form.Item
              name="code"
              label="Mã phòng ban"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã phòng ban",
                },
              ]}
            >
              <Input placeholder="Nhập mã phòng ban" />
            </Form.Item> */}

            <Form.Item name="description" label="Mô tả">
              <TextArea
                placeholder="Nhập mô tả về phòng ban (không bắt buộc)"
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>

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
                  onClick={() => navigate("/admin/departments")}
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

export default DepartmentForm;
