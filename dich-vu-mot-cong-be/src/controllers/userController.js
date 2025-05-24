const { User, Department } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Department }]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Department }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, email, full_name, role, department_id, student_id } = req.body;

        // Kiểm tra xem username hoặc email đã tồn tại chưa
        const existingUserByUsernameOrEmail = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUserByUsernameOrEmail) {
            return res.status(400).json({
                message: 'Username or email already exists',
                details: 'Tên đăng nhập hoặc email đã tồn tại trong hệ thống.'
            });
        }

        // Nếu là sinh viên và có student_id, kiểm tra xem student_id đã tồn tại chưa
        if (role === 'student' && student_id) {
            const existingUserByStudentId = await User.findOne({
                where: { student_id }
            });

            if (existingUserByStudentId) {
                return res.status(400).json({
                    message: 'Student ID already exists',
                    details: 'Mã sinh viên đã tồn tại trong hệ thống.'
                });
            }
        }

        // Xử lý department_id và student_id dựa trên role
        let userData = {
            username,
            password,
            email,
            full_name,
            role
        };

        // Nếu là sinh viên, chỉ lưu student_id, không lưu department_id
        if (role === 'student') {
            userData.student_id = student_id;
            userData.department_id = null;
        } else {
            // Nếu là nhân viên hoặc admin, lưu department_id, không lưu student_id
            userData.department_id = department_id;
            userData.student_id = null;
        }

        // Tạo người dùng mới
        const user = await User.create(userData);

        // Lấy thông tin người dùng đã tạo (không bao gồm mật khẩu)
        const userWithoutPassword = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Department }]
        });

        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message,
            details: 'Đã xảy ra lỗi khi tạo người dùng mới. Vui lòng thử lại sau.'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, password, email, full_name, role, student_id, department_id } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo mảng điều kiện tìm kiếm
        const orConditions = [];

        // Chỉ kiểm tra username nếu nó được cung cấp và khác với username hiện tại
        if (username && username !== user.username) {
            orConditions.push({ username });
        }

        // Chỉ kiểm tra email nếu nó được cung cấp và khác với email hiện tại
        if (email && email !== user.email) {
            orConditions.push({ email });
        }

        // Chỉ kiểm tra student_id nếu nó được cung cấp và khác với student_id hiện tại
        if (student_id && student_id !== user.student_id) {
            orConditions.push({ student_id });
        }

        // Kiểm tra xem có người dùng khác với các thông tin trùng lặp không
        if (orConditions.length > 0) {
            const existingUser = await User.findOne({
                where: {
                    id: { [Op.ne]: req.params.id },
                    [Op.or]: orConditions
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: 'Username, email or student ID already exists',
                    details: 'Tên đăng nhập, email hoặc mã sinh viên đã tồn tại trong hệ thống.'
                });
            }
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {};

        // Chỉ cập nhật các trường được cung cấp
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (full_name) updateData.full_name = full_name;

        // Xử lý role, department_id và student_id dựa trên vai trò
        if (role) {
            updateData.role = role;

            // Nếu là sinh viên
            if (role === 'student') {
                // Đảm bảo có student_id
                if (student_id === undefined || student_id === null || student_id === '') {
                    return res.status(400).json({
                        message: 'Student ID is required for student role',
                        details: 'Mã sinh viên là bắt buộc đối với tài khoản sinh viên.'
                    });
                }
                updateData.student_id = student_id;
                updateData.department_id = null; // Sinh viên không có department_id
            } else {
                // Nếu là nhân viên hoặc admin
                updateData.student_id = null; // Không phải sinh viên thì không có student_id

                // Đảm bảo có department_id
                if (department_id === undefined || department_id === null || department_id === '') {
                    return res.status(400).json({
                        message: 'Department ID is required for staff or admin role',
                        details: 'Phòng ban là bắt buộc đối với tài khoản nhân viên hoặc quản trị viên.'
                    });
                }
                updateData.department_id = department_id;
            }
        } else {
            // Nếu không thay đổi role, xử lý student_id và department_id dựa trên role hiện tại
            if (user.role === 'student') {
                // Nếu là sinh viên, chỉ cập nhật student_id nếu được cung cấp
                if (student_id !== undefined) {
                    if (student_id === null || student_id === '') {
                        return res.status(400).json({
                            message: 'Student ID is required for student role',
                            details: 'Mã sinh viên là bắt buộc đối với tài khoản sinh viên.'
                        });
                    }
                    updateData.student_id = student_id;
                }
                updateData.department_id = null; // Sinh viên không có department_id
            } else {
                // Nếu là nhân viên hoặc admin, chỉ cập nhật department_id nếu được cung cấp
                if (department_id !== undefined) {
                    if (department_id === null || department_id === '') {
                        return res.status(400).json({
                            message: 'Department ID is required for staff or admin role',
                            details: 'Phòng ban là bắt buộc đối với tài khoản nhân viên hoặc quản trị viên.'
                        });
                    }
                    updateData.department_id = department_id;
                }
                updateData.student_id = null; // Không phải sinh viên thì không có student_id
            }
        }

        // Xử lý mật khẩu
        if (password) {
            // Không cần mã hóa mật khẩu ở đây vì model User đã có hook beforeUpdate
            // Hook sẽ tự động mã hóa mật khẩu khi phát hiện password thay đổi
            updateData.password = password;

            console.log('Đang cập nhật mật khẩu mới:', password);
        }

        // Cập nhật người dùng
        await user.update(updateData);

        // Lấy thông tin người dùng đã cập nhật
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Department }]
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            message: 'Error updating user',
            error: error.message,
            details: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng. Vui lòng thử lại sau.'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                details: 'Không tìm thấy người dùng với ID đã cung cấp.'
            });
        }

        // Kiểm tra xem người dùng có phải là admin cuối cùng không
        if (user.role === 'admin') {
            const adminCount = await User.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    message: 'Cannot delete the last admin',
                    details: 'Không thể xóa tài khoản admin cuối cùng trong hệ thống.'
                });
            }
        }

        // Thực hiện xóa người dùng
        await user.destroy();

        res.json({
            message: 'User deleted successfully',
            details: 'Đã xóa người dùng thành công.'
        });
    } catch (error) {
        console.error('Error deleting user:', error);

        // Kiểm tra lỗi liên quan đến khóa ngoại
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                message: 'Cannot delete user with associated records',
                details: 'Không thể xóa người dùng này vì họ có dữ liệu liên quan trong hệ thống.'
            });
        }

        res.status(500).json({
            message: 'Error deleting user',
            error: error.message,
            details: 'Đã xảy ra lỗi khi xóa người dùng. Vui lòng thử lại sau.'
        });
    }
};

const getUsersByDepartment = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { department_id: req.params.departmentId },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department users', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByDepartment
};