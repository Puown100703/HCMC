import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Statistic, Spin, Typography } from "antd";
import {
  ApartmentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import departmentService from "../../services/departmentService";
import formTemplateService from "../../services/formTemplateService";
import submittedFormService from "../../services/submittedFormService";

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    departments: 0,
    formTemplates: 0,
    pendingSubmissions: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const departments = await departmentService.getAllDepartments();
        const formTemplates = await formTemplateService.getAllFormTemplates();
        const submissions = await submittedFormService.getAllSubmittedForms();

        const pendingSubmissions = submissions.filter(
          (sub) => sub.status === "pending"
        );

        setStats({
          departments: departments.length,
          formTemplates: formTemplates.length,
          pendingSubmissions: pendingSubmissions.length,
          totalSubmissions: submissions.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* <Title level={2} style={{ marginBottom: 24 }}>
        Tổng quan hệ thống
      </Title> */}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khoa/Phòng ban"
              value={stats.departments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Mẫu biểu"
              value={stats.formTemplates}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hồ sơ chờ xử lý"
              value={stats.pendingSubmissions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số hồ sơ"
              value={stats.totalSubmissions}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Quản lý hệ thống" style={{ minHeight: 300 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Link to="/admin/departments">
                <Card hoverable>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ApartmentOutlined
                      style={{ fontSize: 24, marginRight: 12 }}
                    />
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                        Quản lý Khoa/Phòng ban
                      </h3>
                      <p style={{ fontSize: 12, color: "#666" }}>
                        Thêm, sửa, xóa thông tin Khoa/Phòng ban
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/admin/users">
                <Card hoverable>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ApartmentOutlined
                      style={{ fontSize: 24, marginRight: 12 }}
                    />
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                        Quản lý người dùng
                      </h3>
                      <p style={{ fontSize: 12, color: "#666" }}>
                        Quản lý tài khoản người dùng, phân quyền
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/admin/form-templates">
                <Card hoverable>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FileTextOutlined
                      style={{ fontSize: 24, marginRight: 12 }}
                    />
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                        Quản lý mẫu biểu
                      </h3>
                      <p style={{ fontSize: 12, color: "#666" }}>
                        Tạo và quản lý các mẫu biểu của hệ thống
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Hoạt động gần đây" style={{ minHeight: 300 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {stats.pendingSubmissions > 0 ? (
                <Card
                  hoverable
                  style={{
                    borderLeft: "4px solid #faad14",
                    background: "#fffbe6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <WarningOutlined
                      style={{
                        fontSize: 20,
                        color: "#faad14",
                        marginRight: 12,
                      }}
                    />
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#d46b08",
                        }}
                      >
                        Hồ sơ đang chờ xử lý
                      </h3>
                      <p style={{ fontSize: 12, color: "#d46b08" }}>
                        Có {stats.pendingSubmissions} hồ sơ đang chờ xử lý.
                        <Link
                          to="/staff/submissions"
                          style={{ marginLeft: 8, color: "#1890ff" }}
                        >
                          Xem ngay
                        </Link>
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card
                  hoverable
                  style={{
                    borderLeft: "4px solid #52c41a",
                    background: "#f6ffed",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleOutlined
                      style={{
                        fontSize: 20,
                        color: "#52c41a",
                        marginRight: 12,
                      }}
                    />
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#389e0d",
                        }}
                      >
                        Không có hồ sơ đang chờ
                      </h3>
                      <p style={{ fontSize: 12, color: "#389e0d" }}>
                        Tất cả hồ sơ đã được xử lý.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <Card
                hoverable
                style={{
                  borderLeft: "4px solid #1890ff",
                  background: "#e6f7ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BarChartOutlined
                    style={{ fontSize: 20, color: "#1890ff", marginRight: 12 }}
                  />
                  <div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#096dd9",
                      }}
                    >
                      Thống kê hệ thống
                    </h3>
                    <p style={{ fontSize: 12, color: "#096dd9" }}>
                      Tổng cộng {stats.totalSubmissions} hồ sơ đã được gửi trong
                      hệ thống.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
