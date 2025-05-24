const { FormTemplate, Department, User } = require('../models');
const mammoth = require('mammoth');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Cấu hình multer để lưu trữ file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/form-templates');
        fs.ensureDirSync(uploadDir); // Đảm bảo thư mục tồn tại
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file docx
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file .docx'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

// Middleware xử lý upload file
const uploadFormTemplate = upload.single('file');

// Lấy tất cả mẫu biểu
const getAllFormTemplates = async (req, res) => {
    try {
        const formTemplates = await FormTemplate.findAll({
            include: [
                { model: Department, as: 'Department' },
                { model: User, as: 'uploader', attributes: ['id', 'username', 'full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(formTemplates);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy mẫu form', error: error.message });
    }
};

// Lấy mẫu biểu theo ID
const getFormTemplateById = async (req, res) => {
    try {
        const formTemplate = await FormTemplate.findByPk(req.params.id, {
            include: [
                { model: Department, as: 'Department' },
                { model: User, as: 'uploader', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        if (!formTemplate) {
            return res.status(404).json({ message: 'Không tìm thấy mẫu biểu mẫu' });
        }

        res.json(formTemplate);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy mẫu form', error: error.message });
    }
};
// Lấy mẫu biểu theo phòng ban
const getFormTemplatesByDepartment = async (req, res) => {
    try {
        const { department_id } = req.params; // Lấy department_id từ query params
        if (!department_id) {
            return res.status(400).json({ message: 'Vui lòng cung cấp department_id' });
        }
        console.log("object", department_id)
        const formTemplates = await FormTemplate.findAll({
            where: { department_id },
            include: [
                { model: Department, as: 'Department', attributes: ['id', 'name'] },
                { model: User, as: 'uploader', attributes: ['id', 'username', 'full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        if (!formTemplates.length) {
            return res.status(404).json({ message: 'Không tìm thấy mẫu biểu cho phòng ban này' });
        }

        res.json(formTemplates);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy mẫu biểu theo phòng ban', error: error.message });
    }
};

// Tạo mẫu biểu mới
const createFormTemplate = async (req, res) => {
    try {
        uploadFormTemplate(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'Lỗi tải lên tệp', error: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            // Nếu không có file
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng tải lên một tệp tin' });
            }

            const { title, category, department_id } = req.body;

            // Đường dẫn đến file đã upload
            const filePath = req.file.path;
            const fileUrl = `/uploads/form-templates/${path.basename(filePath)}`;

            // Chuyển đổi docx sang HTML với các tùy chọn định dạng
            const result = await mammoth.convertToHtml({
                path: filePath,
                transformDocument: mammoth.transforms.paragraph(function (paragraph) {
                    // Giữ lại định dạng đoạn văn và căn lề
                    return paragraph;
                }),
                ignoreEmptyParagraphs: false,
                preserveStyles: true
            });

            // Thêm CSS cho định dạng A4 và các style cần thiết
            const cssStyles = `
                <style>
                    .a4-container {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 20mm;
                        margin: 0 auto;
                        background-color: white;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.5;
                        position: relative;
                    }
                    .a4-container p:nth-of-type(-n+3) {
                        text-align: center;
                        font-weight: bold;
                    }
                    @media print {
                        .a4-container {
                            width: 100%;
                            height: 100%;
                            padding: 0;
                            margin: 0;
                            box-shadow: none;
                        }
                        body {
                            background-color: white;
                        }
                    }
                    
                    /* Giữ nguyên định dạng từ file gốc */
                    .preserve-format {
                        white-space: pre-wrap;
                    }
                    
                    /* Định dạng tiêu đề */
                    .document-header {
                        text-align: center;
                        font-weight: bold;
                    }
                    
                    /* Định dạng header với phân bố đều */
                    .document-header-row {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        padding-top: 10px;
                    }
                    
                    /* Định dạng tiêu đề đơn */
                    .document-title {
                        text-align: center;
                        font-weight: bold;
                        font-size: 14pt;
                        margin-top: 20pt;
                        margin-bottom: 20pt;
                    }
                    
                    /* Định dạng chung */
                    h1, h2, h3, h4 {
                        font-weight: bold;
                        margin-top: 12pt;
                        margin-bottom: 6pt;
                    }
                    
                    p {
                        text-align: left;
                    }
                    
                    strong {
                        font-weight: bold;
                    }
                    
                    em {
                        font-style: italic;
                    }
                    
                    /* Định dạng bảng */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10pt 0;
                    }
                    
                    table td, table th {
                        border: 1px solid #000;
                        padding: 5pt;
                        vertical-align: top;
                    }
                    
                    /* Định dạng checkbox */
                    input[type="checkbox"] {
                        margin-right: 5pt;
                        transform: scale(1.2);
                    }
                    
                    /* Các lớp tiện ích */
                    .text-center {
                        text-align: center !important;
                    }
                    
                    .text-right {
                        text-align: right !important;
                    }
                    
                    .text-left {
                        text-align: left !important;
                    }
                    
                    .text-bold {
                        font-weight: bold;
                    }
                    
                    .text-italic {
                        font-style: italic;
                    }
                    
                    /* Định dạng cho phần chữ ký */
                    .signature-section {
                        text-align: right;
                        margin-top: 20pt;
                        margin-right: 50pt;
                    }
                    
                    /* Định dạng cho các dòng có dấu chấm */
                    .dotted-line {
                        border-bottom: 1px dotted #000;
                        display: inline-block;
                        min-width: 150px;
                    }
                    
                    /* Định dạng footer */
                    .document-footer {
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                        padding-top: 40px;
                    }
                    
                    .footer-right {
                        text-align: right;
                    }
                    .document-footer strong:first-of-type {
                        display: flex;
                        justify-content: space-between !important;
                        width: 100%;
                    }
                    .document-footer strong {
                        display: flex;
                        justify-content: center;
                    }
                </style>
            `;

            // Xử lý HTML để cải thiện hiển thị
            let processedHtml = result.value;
            console.log("valueuee", processedHtml);

            // Xác định các phần header và phân bố đều
            const headerRegex = /<p[^>]*>(CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM|ĐỘC LẬP - TỰ DO - HẠNH PHÚC)[^<]*<\/p>/gi;
            const headerMatches = processedHtml.match(headerRegex);

            if (headerMatches && headerMatches.length >= 2) {
                processedHtml = processedHtml.replace(headerRegex, function (match) {
                    return match.replace('<p', '<p class="document-header"');
                });

                // Tạo header row với phân bố đều
                let headerHtml = '<div class="document-header-row">';
                headerMatches.forEach((match, index) => {
                    headerHtml += match.replace('<p', `<p class="document-header ${index === 0 ? 'text-left' : 'text-right'}"`);
                });
                headerHtml += '</div>';
                processedHtml = processedHtml.replace(headerRegex, headerHtml);
            } else if (headerMatches && headerMatches.length === 1) {
                processedHtml = processedHtml.replace(headerRegex, function (match) {
                    return match.replace('<p', '<p class="document-header text-center"');
                });
            }

            // Thêm class cho tiêu đề đơn
            processedHtml = processedHtml.replace(/<p[^>]*>(ĐƠN|GIẤY|PHIẾU)[^<]*<\/p>/i, function (match) {
                return match.replace('<p', '<p class="document-title"');
            });

            // Thay thế các bảng có checkbox bằng div có định dạng tốt hơn
            processedHtml = processedHtml.replace(/<table>[\s\S]*?<\/table>/g, function (match) {
                if (match.includes('checkbox')) {
                    const checkboxItems = [];
                    const regex = /<p><input type="checkbox"[^>]*\/>\s*(.*?)<\/p>/g;
                    let checkboxMatch;

                    while ((checkboxMatch = regex.exec(match)) !== null) {
                        checkboxItems.push(checkboxMatch[1].trim());
                    }

                    if (checkboxItems.length > 0) {
                        let html = '<div class="checkbox-container">';
                        for (let i = 0; i < checkboxItems.length; i += 2) {
                            html += '<div class="checkbox-row" style="display: flex; justify-content: space-between; margin-bottom: 10pt;">';
                            html += `<div class="checkbox-item" style="width: 48%; display: flex; align-items: center;">
                                <input type="checkbox" id="reason${i + 1}" name="reason" />
                                <label for="reason${i + 1}">${checkboxItems[i]}</label>
                            </div>`;
                            if (i + 1 < checkboxItems.length) {
                                html += `<div class="checkbox-item" style="width: 48%; display: flex; align-items: center;">
                                    <input type="checkbox" id="reason${i + 2}" name="reason" />
                                    <label for="reason${i + 2}">${checkboxItems[i + 1]}</label>
                                </div>`;
                            }
                            html += '</div>';
                        }
                        html += '</div>';
                        return html;
                    }
                }
                return match;
            });

            // Thêm dấu chấm cho các trường thông tin cá nhân
            processedHtml = processedHtml.replace(/<p[^>]*>([^<]+)<\/p>/g, function (match, textInside) {
                const updated = textInside.replace(/:(?!\s*[.\.])/g, ': <span>.................</span>');
                return `<p>${updated}</p>`;
            });

            // Xử lý các footer đơn
            const singleFooterRegex = /<p[^>]*><em>(.*?)<\/em><\/p>\s*<p[^>]*><strong>(.*?)<\/strong><\/p>/gi;
            processedHtml = processedHtml.replace(
                singleFooterRegex,
                (match, dateText, signerText) => {
                    return `
                            <div class="document-footer" style="text-align: right; padding-top: 40px;display:flex;flex-direction:column;align-items:flex-end">
                                <div><em>${dateText}</em></div>
                                <div><strong>${signerText}</strong></div>
                            </div>
                            `;
                }
            );

            // Xử lý footer khối
            const footerBlockRegex = /(XÁC NHẬN BCHQS PHƯỜNG)[\s\S]*?(Dư Hàng Kênh),?\s*(ngày.*?năm\s*20[0-9]{2})[\s\S]*?(Người làm đơn|Sinh viên|CHỦ TRÌ CUỘC HỌP|THƯ KÝ)/gi;
            processedHtml = processedHtml.replace(
                footerBlockRegex,
                (match, signerLeft, location, date, signerRight) => {
                    return `
                            <div class="document-footer" style="display: flex; justify-content: space-between; padding-top: 40px;">
                                <div class="footer-left">
                                <strong>${signerLeft}</strong>
                                </div>
                                <div class="footer-right" style="text-align: right;">
                                <div><em>${location}, ${date}</em></div>
                                <div><strong>${signerRight}</strong></div>
                                </div>
                            </div>
                            `;
                }
            );

            // Kết hợp CSS và HTML
            const htmlContent = `
                ${cssStyles}
                <div class="a4-container">
                    ${processedHtml}
                </div>
            `;

            // Lưu vào database
            const formTemplate = await FormTemplate.create({
                title,
                file_url: fileUrl,
                html_content: htmlContent,
                category,
                department_id,
                uploaded_by: req.user.id
            });

            res.status(201).json(formTemplate);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating form template', error: error.message });
    }
};

// Cập nhật mẫu biểu
const updateFormTemplate = async (req, res) => {
    try {
        uploadFormTemplate(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'File upload error', error: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            const formTemplate = await FormTemplate.findByPk(req.params.id);

            if (!formTemplate) {
                return res.status(404).json({ message: 'Form template not found' });
            }

            const { title, category, department_id } = req.body;
            const updateData = { title, category, department_id };

            // Nếu có file mới được upload
            if (req.file) {
                // Xóa file cũ nếu có
                if (formTemplate.file_url) {
                    const oldFilePath = path.join(__dirname, '../../', formTemplate.file_url.replace(/^\//, ''));
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }

                // Đường dẫn đến file mới
                const filePath = req.file.path;
                const fileUrl = `/uploads/form-templates/${path.basename(filePath)}`;

                // Chuyển đổi docx sang HTML với các tùy chọn định dạng
                const result = await mammoth.convertToHtml({
                    path: filePath,
                    transformDocument: mammoth.transforms.paragraph(function (paragraph) {
                        // Giữ lại định dạng đoạn văn
                        return paragraph;
                    }),
                    ignoreEmptyParagraphs: false,
                    preserveStyles: true
                });

                // Thêm CSS cho định dạng A4 và các style cần thiết - giống như trong createFormTemplate
                const cssStyles = `
                    <style>
                        .a4-container {
                            width: 210mm;
                            min-height: 297mm;
                            padding: 20mm;
                            margin: 0 auto;
                            background-color: white;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            font-family: 'Times New Roman', Times, serif;
                            font-size: 12pt;
                            line-height: 1.5;
                            position: relative;
                        }
                        
                        @media print {
                            .a4-container {
                                width: 100%;
                                height: 100%;
                                padding: 0;
                                margin: 0;
                                box-shadow: none;
                            }
                            body {
                                background-color: white;
                            }
                        }
                        
                        /* Định dạng tiêu đề */
                        .a4-container p:nth-child(1), 
                        .a4-container p:nth-child(2) {
                            text-align: center;
                            font-weight: bold;
                        }
                        
                        /* Định dạng tiêu đề đơn */
                        .a4-container p:nth-child(3) {
                            text-align: center;
                            font-weight: bold;
                            font-size: 14pt;
                            margin-top: 20pt;
                            margin-bottom: 20pt;
                        }
                        
                        /* Định dạng chung */
                        h1, h2, h3, h4 {
                            font-weight: bold;
                            margin-top: 12pt;
                            margin-bottom: 6pt;
                            text-align: center;
                        }
                        
                        p {
                            margin: 6pt 0;
                        }
                        
                        strong {
                            font-weight: bold;
                        }
                        
                        em {
                            font-style: italic;
                        }
                        
                        /* Định dạng bảng */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10pt 0;
                        }
                        
                        table td, table th {
                            border: 1px solid #000;
                            padding: 5pt;
                            vertical-align: top;
                        }
                        
                        /* Định dạng checkbox */
                        input[type="checkbox"] {
                            margin-right: 5pt;
                            transform: scale(1.2);
                        }
                        
                        /* Các lớp tiện ích */
                        .text-center {
                            text-align: center;
                        }
                        
                        .text-right {
                            text-align: right;
                        }
                        
                        .text-bold {
                            font-weight: bold;
                        }
                        
                        .text-italic {
                            font-style: italic;
                        }
                        
                        /* Định dạng cho phần chữ ký */
                        .signature-section {
                            text-align: right;
                            margin-top: 20pt;
                            margin-right: 50pt;
                        }
                        
                        /* Định dạng cho các dòng có dấu chấm */
                        .dotted-line {
                            display: inline-block;
                            min-width: 100px;
                        }
                        
                        /* Định dạng cho các ô nhập liệu */
                        .form-field {
                            display: inline-block;
                            min-width: 150px;
                            border-bottom: 1px solid #000;
                            margin: 0 5pt;
                        }
                    </style>
                `;

                // Xử lý HTML để cải thiện hiển thị - giống như trong createFormTemplate
                let processedHtml = result.value;

                // Thay thế các bảng có checkbox bằng div có định dạng tốt hơn
                processedHtml = processedHtml.replace(/<table>[\s\S]*?<\/table>/g, function (match) {
                    // Kiểm tra nếu bảng chứa checkbox
                    if (match.includes('checkbox')) {
                        // Trích xuất các mục checkbox từ bảng
                        const checkboxItems = [];
                        const regex = /<p><input type="checkbox"[^>]*\/>\s*(.*?)<\/p>/g;
                        let checkboxMatch;

                        while ((checkboxMatch = regex.exec(match)) !== null) {
                            checkboxItems.push(checkboxMatch[1].trim());
                        }

                        // Nếu có các mục checkbox, tạo layout mới
                        if (checkboxItems.length > 0) {
                            let html = '<div class="checkbox-container">';

                            // Tạo các hàng với 2 checkbox mỗi hàng
                            for (let i = 0; i < checkboxItems.length; i += 2) {
                                html += '<div class="checkbox-row" style="display: flex; justify-content: space-between; margin-bottom: 10pt;">';

                                // Checkbox đầu tiên
                                html += `<div class="checkbox-item" style="width: 48%; display: flex; align-items: center;">
                                    <input type="checkbox" id="reason${i + 1}" name="reason" />
                                    <label for="reason${i + 1}">${checkboxItems[i]}</label>
                                </div>`;

                                // Checkbox thứ hai (nếu có)
                                if (i + 1 < checkboxItems.length) {
                                    html += `<div class="checkbox-item" style="width: 48%; display: flex; align-items: center;">
                                        <input type="checkbox" id="reason${i + 2}" name="reason" />
                                        <label for="reason${i + 2}">${checkboxItems[i + 1]}</label>
                                    </div>`;
                                }

                                html += '</div>';
                            }

                            html += '</div>';
                            return html;
                        }
                    }

                    // Nếu không phải bảng checkbox, giữ nguyên
                    return match;
                });

                // Thêm dấu chấm cho các trường thông tin cá nhân
                processedHtml = processedHtml.replace(/([^>])(:\s*)<\/p>/g, function (match, p1, p2) {
                    // Thêm dấu chấm sau dấu hai chấm
                    return p1 + p2 + '<span class="dotted-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>';
                });

                // Cải thiện hiển thị ngày tháng năm
                processedHtml = processedHtml.replace(/(ngày|tháng|năm)(\s*\.\.\.|…)(\s*)/gi, function (match, p1, p2, p3) {
                    return p1 + ' <span class="form-field">&nbsp;&nbsp;&nbsp;&nbsp;</span>' + p3;
                });

                // Kết hợp CSS và HTML
                const htmlContent = `
                    ${cssStyles}
                    <div class="a4-container">
                        ${processedHtml}
                    </div>
                `;

                // Cập nhật thông tin file
                updateData.file_url = fileUrl;
                updateData.html_content = htmlContent;
            }

            // Cập nhật trong database
            await formTemplate.update(updateData);

            res.json(await FormTemplate.findByPk(req.params.id, {
                include: [
                    { model: Department, as: 'Department' }, // Sửa lại alias để khớp với getAllFormTemplates
                    { model: User, as: 'uploader', attributes: ['id', 'username', 'full_name'] }
                ]
            }));
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating form template', error: error.message });
    }
};

// Xóa mẫu biểu
const deleteFormTemplate = async (req, res) => {
    try {
        const formTemplate = await FormTemplate.findByPk(req.params.id);

        if (!formTemplate) {
            return res.status(404).json({ message: 'Form template not found' });
        }

        // Xóa file nếu có
        if (formTemplate.file_url) {
            const filePath = path.join(__dirname, '../../', formTemplate.file_url.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await formTemplate.destroy();

        res.json({ message: 'Form template deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting form template', error: error.message });
    }
};

module.exports = {
    getAllFormTemplates,
    getFormTemplateById,
    createFormTemplate,
    updateFormTemplate,
    deleteFormTemplate,
    getFormTemplatesByDepartment
};