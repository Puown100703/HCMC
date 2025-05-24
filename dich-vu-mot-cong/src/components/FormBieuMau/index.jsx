import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Checkbox, Space, Divider, message } from "antd";
import "antd/dist/reset.css";
import formTemplateService from "../../services/formTemplateService";
import submittedFormService from "../../services/submittedFormService";
import { de } from "date-fns/locale";

const FormModal = ({ isModal = false, setIsModal, idShow, templateData }) => {
  console.log("object", templateData);
  const [isOpen, setIsOpen] = useState(isModal);
  const [template, setTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef(null);
  const fieldRefs = useRef({});

  useEffect(() => {
    if (isModal) {
      setIsOpen(isModal);
    }
  }, [isModal]);

  // Lịch sử cho undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Lấy template từ backend
  useEffect(() => {
    if (idShow) {
      fetchFormTemplate();
    }
  }, [idShow]);

  const fetchFormTemplate = async () => {
    try {
      const data = await formTemplateService.getFormTemplateById(idShow);
      setTemplate(data.html_content);
    } catch (err) {
      console.error("Lỗi khi lấy template:", err);
      message.error("Không thể tải thông tin mẫu biểu");
    }
  };

  // Lưu lịch sử cho undo/redo
  const saveHistory = () => {
    if (contentRef.current) {
      console.log("Lưu lịch sử HTML:", contentRef.current.innerHTML);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        html: contentRef.current.innerHTML,
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Xử lý khi nhập liệu trong contenteditable
  const handleInput = (field) => {
    saveHistory();
    if (fieldRefs.current[field]) {
      fieldRefs.current[field].focus();
    }
  };

  // Xử lý khi thay đổi checkbox
  const handleCheckboxChange = (e) => {
    const input = e.target;
    console.log(`Checkbox ${input.id} thay đổi thành: ${input.checked}`);
    input.checked = input.checked;
    if (input.checked) {
      input.setAttribute("checked", "checked");
    } else {
      input.removeAttribute("checked");
    }
    setTimeout(() => {
      console.log(
        `HTML sau khi cập nhật checkbox ${input.id}:`,
        contentRef.current.innerHTML
      );
      saveHistory();
    }, 0);
  };

  // Xử lý undo/redo
  const handleKeyDown = (e, field) => {
    if (e.ctrlKey && e.key === "z" && historyIndex > 0) {
      e.preventDefault();
      const prevState = history[historyIndex - 1];
      if (contentRef.current) {
        contentRef.current.innerHTML = prevState.html;
        setHistoryIndex(historyIndex - 1);
        if (fieldRefs.current[field]) {
          fieldRefs.current[field].focus();
        }
      }
    } else if (
      e.ctrlKey &&
      e.key === "y" &&
      historyIndex < history.length - 1
    ) {
      e.preventDefault();
      const nextState = history[historyIndex + 1];
      if (contentRef.current) {
        contentRef.current.innerHTML = nextState.html;
        setHistoryIndex(historyIndex + 1);
        if (fieldRefs.current[field]) {
          fieldRefs.current[field].focus();
        }
      }
    }
  };

  // Kiểm tra các trường bắt buộc
  const validateForm = () => {
    if (!contentRef.current) return false;

    const editableFields =
      contentRef.current.querySelectorAll(".editable-field");
    let isValid = true;
    let emptyFields = [];

    // Kiểm tra các trường ngày tháng năm
    const dateField = contentRef.current.querySelector('[data-field="date"]');
    const monthField = contentRef.current.querySelector('[data-field="month"]');
    const yearField = contentRef.current.querySelector('[data-field="year"]');

    if (dateField && !dateField.textContent.trim()) {
      dateField.style.borderBottom = "2px solid red";
      isValid = false;
      emptyFields.push("Ngày");
    }

    if (monthField && !monthField.textContent.trim()) {
      monthField.style.borderBottom = "2px solid red";
      isValid = false;
      emptyFields.push("Tháng");
    }

    if (yearField && !yearField.textContent.trim()) {
      yearField.style.borderBottom = "2px solid red";
      isValid = false;
      emptyFields.push("Năm");
    }

    // Kiểm tra các trường thông tin cá nhân quan trọng
    const personalFields = Array.from(editableFields).filter((field) => {
      const fieldName = field.dataset.field;
      return (
        fieldName.startsWith("field_") &&
        (fieldName === "field_0" ||
          fieldName === "field_1" ||
          fieldName === "field_2")
      );
    });

    personalFields.forEach((field) => {
      if (!field.textContent.trim()) {
        field.style.borderBottom = "2px solid red";
        isValid = false;
        emptyFields.push("Thông tin cá nhân");
      }
    });

    if (!isValid) {
      message.error(
        `Vui lòng điền đầy đủ thông tin: ${emptyFields.join(", ")}`
      );
    }

    return isValid;
  };

  // Xử lý lưu HTML khi nhấn Save
  const handleSave = async () => {
    if (!contentRef.current) return;

    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const finalHtml = contentRef.current.innerHTML;
      console.log("HTML đã lưu:", finalHtml);

      // Chuẩn bị dữ liệu để gửi
      const formData = {
        template_id: idShow,
        html_content: finalHtml,
        status: "pending", // Trạng thái chờ duyệt
        submission_date: new Date().toISOString(),
        department_id: templateData.Department.id,
      };

      // Gửi dữ liệu lên server
      const response = await submittedFormService.createSubmittedForm(formData);

      if (response && response.id) {
        message.success("Đơn đã được gửi thành công và đang chờ duyệt!");
        setIsModal(false);
      } else {
        throw new Error("Không nhận được phản hồi từ server");
      }
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
      message.error("Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại sau!");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    setIsModal(false);
  };

  // Thay thế template
  let fieldIndex = 0;
  let modifiedTemplate = template;

  // Thay thế "ngày ... tháng ... năm ..." trước
  modifiedTemplate = modifiedTemplate?.replace(
    /ngày\s*[.]+[\s.]*tháng\s*[.]+[\s.]*năm\s*[.]+/g,
    () => {
      return `ngày <span contenteditable="true" class="editable-field" data-field="date"></span> tháng <span contenteditable="true" class="editable-field" data-field="month"></span> năm <span contenteditable="true" class="editable-field" data-field="year"></span>`;
    }
  );

  // Sau đó thay thế các chuỗi dấu chấm còn lại
  modifiedTemplate = modifiedTemplate?.replace(/[.]+/g, () => {
    const field = `field_${fieldIndex++}`;
    return `<span contenteditable="true" class="editable-field" data-field="${field}"></span>`;
  });

  // Gắn refs và sự kiện
  useEffect(() => {
    if (contentRef.current) {
      // Xóa refs cũ
      fieldRefs.current = {};

      const editableFields =
        contentRef.current.querySelectorAll(".editable-field");
      editableFields.forEach((field) => {
        const fieldName = field.dataset.field;
        fieldRefs.current[fieldName] = field;

        // Sự kiện khi nhập liệu
        const onInput = () => {
          // Xóa border màu đỏ khi người dùng bắt đầu nhập
          field.style.borderBottom = "1px dotted #000";
          handleInput(fieldName);
        };

        // Sự kiện phím
        const onKeyDown = (e) => {
          handleKeyDown(e, fieldName);
        };

        field.addEventListener("input", onInput);
        field.addEventListener("keydown", onKeyDown);

        // Dọn dẹp
        return () => {
          field.removeEventListener("input", onInput);
          field.removeEventListener("keydown", onKeyDown);
        };
      });

      // Xử lý checkbox
      const checkboxInputs = contentRef.current.querySelectorAll(
        'input[type="checkbox"]'
      );
      checkboxInputs.forEach((input) => {
        input.addEventListener("change", handleCheckboxChange);
      });

      return () => {
        checkboxInputs.forEach((input) => {
          input.removeEventListener("change", handleCheckboxChange);
        });
      };
    }
  }, [template]);

  return (
    <div>
      <Modal
        title="Thông tin đăng ký"
        open={isModal}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Gửi duyệt"
        cancelText="Hủy"
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
        confirmLoading={submitting}
      >
        <style>
          {`
            /* Giữ định dạng gốc của template */
            .a4-container{
              padding:5px;
            }
            p:nth-of-type(-n+3) {
              text-align: center;
              font-weight: bold;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
            .text-right {
              text-align: right;
            }
            .checkbox-container {
              margin-bottom: 10pt;
            }
            .checkbox-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10pt;
            }
            .checkbox-item {
              width: 48%;
              display: flex;
              align-items: center;
            }
            input[type="checkbox"] {
              margin-right: 5pt;
              transform: scale(1.2);
            }
            /* Định dạng cho các ô contenteditable */
            .editable-field {
              border-bottom: 1px dotted #000;
              min-width: 100px;
              display: inline-block;
              padding: 2px;
            }
            .editable-field:focus {
              outline: none;
              background-color: #f0f0f0;
            }
            .editable-field.required {
              border-bottom: 1px dotted #ff4d4f;
            }
            .form-instructions {
              margin-bottom: 15px;
              padding: 10px;
              background-color: #f6f6f6;
              border-left: 4px solid #1890ff;
            }
          `}
        </style>
        <div className="form-instructions">
          <p>
            Vui lòng điền đầy đủ thông tin vào các ô có gạch chân. Các trường
            ngày tháng năm là bắt buộc.
          </p>
        </div>
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: modifiedTemplate }}
        />
      </Modal>
    </div>
  );
};

export default FormModal;
