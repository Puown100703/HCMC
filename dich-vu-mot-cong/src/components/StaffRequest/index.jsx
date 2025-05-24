import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Tabs,
  Modal,
  Form,
  Button,
  Tag,
  message,
  Select,
  Card,
} from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import submittedFormService from "../../services/submittedFormService";
import { useAuthContext } from "../../contexts/AuthContext";
const { TabPane } = Tabs;
const { Option } = Select;

const StaffRequests = () => {
  const { departmentId } = useParams(); // Giả định departmentId từ URL
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, logout } = useAuthContext();
  console.log("user", user);
  const shadowRef = useRef(null);

  useEffect(() => {
    if (shadowRef.current && selectedRequest?.html_content) {
      let shadow = shadowRef.current.shadowRoot;

      // Nếu chưa có Shadow Root, tạo mới
      if (!shadow) {
        shadow = shadowRef.current.attachShadow({ mode: "open" });
      }

      // Cập nhật nội dung trong Shadow Root
      shadow.innerHTML = selectedRequest.html_content;
    }
  }, [selectedRequest]);
  // Lấy danh sách yêu cầu theo phòng ban
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response =
          await submittedFormService.getSubmittedFormsByDepartment(
            user?.department_id
          );
        // Đảm bảo response là mảng và lọc theo departmentId nếu cần
        const data = Array.isArray(response) ? response : [];
        const filteredData = departmentId
          ? data.filter((req) => req.Department.id === parseInt(departmentId))
          : data;
        setRequests(filteredData);
      } catch (err) {
        message.error(err.response?.data?.message || "Lỗi khi tải yêu cầu");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [departmentId]);

  // Lọc yêu cầu theo tìm kiếm
  const filterRequests = (requests, status) => {
    let filtered = requests.filter((req) => req.status === status);
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.student?.full_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          req.id?.toString().includes(searchTerm)
      );
    }
    return filtered;
  };

  // Xử lý cập nhật yêu cầu
  const handleUpdateRequest = async (values) => {
    try {
      const formData = {
        ...values,
        assigned_staff_id: user?.id,
      };
      const response = await submittedFormService.updateSubmittedForm(
        selectedRequest.id,
        formData
      );
      setRequests(
        requests.map((req) => (req.id === selectedRequest.id ? response : req))
      );
      setSelectedRequest(null);
      form.resetFields();
      message.success("Cập nhật yêu cầu thành công");
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi cập nhật yêu cầu");
    }
  };

  // Cột của bảng
  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Sinh viên",
      dataIndex: ["student", "full_name"],
      key: "student",
    },
    {
      title: "Mẫu đơn",
      dataIndex: ["FormTemplate", "title"],
      key: "formTemplate",
    },
    {
      title: "Phòng ban",
      dataIndex: ["Department", "name"],
      key: "department",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color, text;
        switch (status) {
          case "pending":
            color = "gold";
            text = "Đang chờ";
            break;
          case "processing":
            color = "blue";
            text = "Đang xử lý";
            break;
          case "approved":
            color = "green";
            text = "Hoàn thành";
            break;
          case "rejected":
            color = "red";
            text = "Từ chối";
            break;
          default:
            color = "gray";
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedRequest(record);
            form.setFieldsValue({
              status: record.status,
              comments: record.comments || "",
            });
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Tìm kiếm */}
      <div className="mb-6">
        <Input
          placeholder="Tìm theo tên sinh viên hoặc mã yêu cầu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", maxWidth: 300 }}
        />
      </div>

      {/* Tabs theo trạng thái */}
      <Tabs defaultActiveKey="pending">
        <TabPane tab="Đang chờ" key="pending">
          <Table
            columns={columns}
            dataSource={filterRequests(requests, "pending")}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: "Không có yêu cầu đang chờ" }}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Đang xử lý" key="processing">
          <Table
            columns={columns}
            dataSource={filterRequests(requests, "processing")}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: "Không có yêu cầu đang xử lý" }}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Đã duyệt" key="approved">
          <Table
            columns={columns}
            dataSource={filterRequests(requests, "approved")}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: "Không có yêu cầu đã duyệt" }}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Từ chối" key="rejected">
          <Table
            columns={columns}
            dataSource={filterRequests(requests, "rejected")}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: "Không có yêu cầu đã duyệt" }}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      {/* Modal chi tiết yêu cầu */}
      <Modal
        title={`Chi tiết Yêu cầu #${selectedRequest?.id}`}
        open={!!selectedRequest}
        onCancel={() => {
          setSelectedRequest(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <div>
            <div className="mb-4">
              {/* Card cho Sinh viên */}
              <Card title="Sinh viên" size="small" className="mb-2">
                {selectedRequest.student.full_name}
              </Card>
              {/* Card cho Mẫu đơn */}
              <Card title="Mẫu đơn" size="small" className="mb-2">
                {selectedRequest.FormTemplate.title}
              </Card>
              {/* Card cho Phòng ban */}
              <Card title="Phòng ban" size="small" className="mb-2">
                {selectedRequest?.Department?.name || "Chưa xác định"}
              </Card>
              {/* Card cho Trạng thái */}
              <Card title="Trạng thái" size="small" className="mb-2">
                <Tag
                  color={
                    selectedRequest.status === "pending"
                      ? "gold"
                      : selectedRequest.status === "processing"
                      ? "blue"
                      : selectedRequest.status === "approved"
                      ? "green"
                      : "red"
                  }
                >
                  {selectedRequest.status === "pending"
                    ? "Đang chờ"
                    : selectedRequest.status === "processing"
                    ? "Đang xử lý"
                    : selectedRequest.status === "approved"
                    ? "Hoàn thành"
                    : "Từ chối"}
                </Tag>
              </Card>
              {/* Nội dung form */}
              <div>
                <strong>Nội dung:</strong>
                <div ref={shadowRef} className="border p-3 mt-2" />
              </div>
            </div>

            {/* Form cập nhật */}
            <Form form={form} onFinish={handleUpdateRequest} layout="vertical">
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select>
                  <Option value="pending">Đang chờ</Option>
                  <Option value="processing">Đang xử lý</Option>
                  <Option value="approved">Hoàn thành</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
              </Form.Item>
              <Form.Item name="comments" label="Bình luận">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <div className="flex" style={{ gap: "10px" }}>
                  <Button type="primary" htmlType="submit">
                    Cập nhật
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequest(null);
                      form.resetFields();
                    }}
                  >
                    Đóng
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffRequests;
