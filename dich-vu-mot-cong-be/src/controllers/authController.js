const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        // Kiểm tra nếu người dùng không tồn tại
        if (!user) {
            return res.status(401).json({
                message: 'Tài khoản không tồn tại',
                error_code: 'USER_NOT_FOUND'
            });
        }

        // Kiểm tra mật khẩu bằng phương thức validatePassword
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Mật khẩu không chính xác',
                error_code: 'INVALID_PASSWORD'
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                department_id: user.department_id
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.',
            error_code: 'SERVER_ERROR'
        });
    }
};


const register = async (req, res) => {
    try {
        const { username, password, email, full_name, department_id } = req.body;

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });
        console.log("check", existingUser)
        if (existingUser) {
            return res.status(400).json({ message: 'Tên người dùng, email hoặc ID sinh viên đã tồn tại' });
        }

        const user = await User.create({
            username,
            password,
            email,
            full_name,
            student_id,
            department_id,
            role: 'student'
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                department_id: user.department_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký người dùng', error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: ['department']
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký người dùng', error: error.message });
    }
};

module.exports = {
    login,
    register,
    getProfile
}; 