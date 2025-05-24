const { sendEmail } = require('../config/emailConfig');

/**
 * Gửi email thông báo khi trạng thái hồ sơ thay đổi
 * @param {Object} submission - Thông tin hồ sơ đã nộp
 * @param {Object} student - Thông tin sinh viên
 * @param {Object} formTemplate - Thông tin mẫu biểu
 * @param {Object} staff - Thông tin nhân viên xử lý (nếu có)
 * @param {Object} department - Thông tin phòng ban
 */
const sendStatusUpdateEmail = async (submission, student, formTemplate, staff, department) => {
    if (!student || !student.email) {
        console.error('Không thể gửi email: Thiếu thông tin email sinh viên');
        return;
    }
    // Tạo nội dung email dựa trên trạng thái
    let statusText = '';
    let statusColor = '';
    let additionalInfo = '';

    switch (submission.status) {
        case 'pending':
            statusText = 'Đang chờ xử lý';
            statusColor = '#FFA500'; // Màu cam
            break;
        case 'processing':
            statusText = 'Đang xử lý';
            statusColor = '#3498DB'; // Màu xanh dương
            additionalInfo = staff ? `<p>Nhân viên xử lý: <strong>${staff.full_name}</strong></p>` : '';
            break;
        case 'approved':
            statusText = 'Đã phê duyệt';
            statusColor = '#2ECC71'; // Màu xanh lá
            additionalInfo = staff ? `<p>Nhân viên phê duyệt: <strong>${staff.full_name}</strong></p>` : '';
            break;
        case 'rejected':
            statusText = 'Đã từ chối';
            statusColor = '#E74C3C'; // Màu đỏ
            additionalInfo = staff ? `<p>Nhân viên từ chối: <strong>${staff.full_name}</strong></p>` : '';
            break;
        default:
            statusText = submission.status;
            statusColor = '#7F8C8D'; // Màu xám
    }

    // Tạo nội dung HTML cho email
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333;">Thông báo cập nhật trạng thái hồ sơ</h2>
                <p style="font-size: 16px;">Hệ thống Dịch vụ Một cửa</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>Kính gửi <strong>${student.full_name}</strong>,</p>
                <p>Hồ sơ của bạn đã được cập nhật trạng thái mới.</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">Thông tin hồ sơ:</h3>
                <p>Mẫu biểu: <strong>${formTemplate.title}</strong></p>
                <p>Phòng ban: <strong>${department.name}</strong></p>
                <p>Ngày nộp: <strong>${new Date(submission.submitted_at).toLocaleString('vi-VN')}</strong></p>
                <p>Trạng thái: <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
                ${additionalInfo}
                ${submission.comments ? `<p>Ghi chú: ${submission.comments}</p>` : ''}
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p>Để xem chi tiết hồ sơ, vui lòng đăng nhập vào hệ thống Dịch vụ Một cửa.</p>
                <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Hệ thống Dịch vụ Một cửa</p>
            </div>
        </div>
    `;

    // Gửi email
    try {
        await sendEmail(
            student.email,
            `[Dịch vụ Một cửa] Cập nhật trạng thái hồ sơ - ${statusText}`,
            htmlContent
        );
        console.log(`Đã gửi email thông báo đến ${student.email}`);
    } catch (error) {
        console.error('Lỗi khi gửi email thông báo:', error);
    }
};

module.exports = {
    sendStatusUpdateEmail
};
