import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Home.css";
import FormModal from "../components/FormBieuMau";
// Bind modal to the app element for accessibility
Modal.setAppElement("#root");
import formTemplateService from "../services/formTemplateService";
import { set } from "date-fns";
const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requests = [
    {
      id: "01",
      title: "Đơn xin Giảm tiền ở nội trú",
      description:
        "Giấy chứng nhận Sinh viên (Tiếng Việt) HIỆU TRƯỞNG TRƯỜNG ĐẠI HỌC Ý VÀ CÔNG NGHỆ HẢI PHÒNG CHỨNG NHẬN",
    },
    {
      id: "02",
      title: "Đơn xin nhập học sau khi kết thúc bản bảo lưu (Mẫu)",
    },
    {
      id: "03",
      title: "Đơn xin thôi học (Mẫu Test)",
    },
    {
      id: "04",
      title:
        "Đơn xin nhập học sau khi hoàn thành chương trình trao đổi (Mẫu Test)",
    },
    {
      id: "05",
      title:
      "Giấy chứng nhận Sinh viên (Tiếng Việt) HIỆU TRƯỞNG TRƯỜNG ĐẠI HỌC QUẢN LÝ VÀ CÔNG NGHỆ HẢI PHÒNG CHỨNG NHẬN",
    },
  ];
  const openModal = () => setIsModalOpen(true);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [idShow, setIdShow] = useState("");
  const closeModal = () => setIsModalOpen(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const handleClick = (id) => {
    // Find the selected template from the formTemplates array
    const template = formTemplates.find((template) => template.id === id);

    if (template) {
      setSelectedTemplate(template);
      setIdShow(id);
      setIsModalFormOpen(true);
    } else {
      message.error("Không tìm thấy mẫu biểu này");
    }
  };
  const [formTemplates, setFormTemplates] = useState([]);
  const fetchFormTemplates = async () => {
    try {
      const data = await formTemplateService.getAllFormTemplates();
      setFormTemplates(data);
    } catch (err) {
      message.error("Không thể tải danh sách mẫu biểu. Vui lòng thử lại sau.");
      console.error("Error fetching form templates:", err);
    }
  };
  useEffect(() => {
    fetchFormTemplates();
  }, []);

  return (
    <div className="home-container">
      <h1>HÀNH CHÍNH MỘT CỬA</h1>
      <ul className="request-list">
        {formTemplates.map((request, index) => (
          <li
            key={request.id}
            className="request-item"
            onClick={() => handleClick(request.id)}
          >
            <span className="request-id">{index + 1}</span>
            <div className="request-content">
              <p className="request-title">{request.title}</p>
            </div>
          </li>
        ))}
      </ul>
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <button className="modal-close-btn" onClick={closeModal}>
            ✕
          </button>
          <div className="modal-header">
            <h3>Vùng lựa chọn Phần mềm học: Mẫu đơn hành chính:</h3>
          </div>
          <ul className="request-list">
            {requests.map((request) => (
              <li
                key={request.id}
                className="request-item"
                onClick={handleClick}
              >
                <span className="request-id">{request.id}</span>
                <div className="request-content">
                  <p className="request-title">{request.title}</p>
                  {/* {request.description && (
                    <p className="request-description">{request.description}</p>
                  )} */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
      <FormModal
        isModal={isModalFormOpen}
        setIsModal={setIsModalFormOpen}
        idShow={idShow}
        templateData={selectedTemplate}
      />
    </div>
  );
};

export default Home;
