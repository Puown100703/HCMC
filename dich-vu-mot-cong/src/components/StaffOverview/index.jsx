import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Modal, Form, Button, message, Row, Col } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import submittedFormService from "../../services/submittedFormService";
import { useAuthContext } from "../../contexts/AuthContext";
const StaffOverview = () => {
  const { departmentId } = useParams(); // Giả định departmentId từ URL
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, logout } = useAuthContext();
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

  // Xử lý cập nhật yêu cầu
  const handleUpdateRequest = async (values) => {
    try {
      const response = await submittedFormService.updateSubmittedForm(
        selectedRequest.id,
        values
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

  // Thống kê số lượng yêu cầu theo trạng thái
  const getStatusCount = (status) => {
    return requests.filter((req) => req.status === status).length;
  };

  // Cột của bảng yêu cầu gần đây
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

  // Lấy 5 yêu cầu gần đây nhất
  const recentRequests = requests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-6">
      {/* Thống kê nhanh */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card title="Đang chờ" bordered={false}>
            <h3 className="text-2xl">{getStatusCount("pending")}</h3>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Đang xử lý" bordered={false}>
            <h3 className="text-2xl">{getStatusCount("processing")}</h3>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Đã duyệt" bordered={false}>
            <h3 className="text-2xl">{getStatusCount("approved")}</h3>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Từ chối" bordered={false}>
            <h3 className="text-2xl">{getStatusCount("rejected")}</h3>
          </Card>
        </Col>
      </Row>

      {/* Thông tin phòng ban */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-semibold">
          Phòng ban:{" "}
          {requests.length > 0 ? requests[0].Department.name : "Chưa xác định"}
        </h3>
      </div> */}

      {/* Yêu cầu gần đây */}
      <h3 className="text-lg font-semibold mb-4">Yêu cầu gần đây</h3>
      <Table
        columns={columns}
        dataSource={recentRequests}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "Không có yêu cầu nào" }}
        pagination={false}
      />

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
              <p>
                <strong>Sinh viên:</strong> {selectedRequest.student.full_name}
              </p>
              <p>
                <strong>Mẫu đơn:</strong> {selectedRequest.FormTemplate.name}
              </p>
              <p>
                <strong>Phòng ban:</strong> {selectedRequest.Department.name}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedRequest.status}
              </p>
              <p>
                <strong>Nội dung:</strong>
              </p>
              <div
                className="border p-3"
                dangerouslySetInnerHTML={{
                  __html: selectedRequest.html_content,
                }}
              />
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
                <div className="flex gap-4">
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

export default StaffOverview;
