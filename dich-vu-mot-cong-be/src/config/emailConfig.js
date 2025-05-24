const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Sử dụng Gmail, bạn có thể thay đổi thành dịch vụ khác
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Email của hệ thống
        pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Mật khẩu ứng dụng (không phải mật khẩu Gmail)
    }
});

// Hàm gửi email
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};
