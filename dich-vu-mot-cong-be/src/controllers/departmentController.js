const { Department, User } = require('../models');
const { Sequelize } = require('sequelize');

const getAllDepartments = async (req, res) => {
    try {
        // Lấy danh sách phòng ban kèm theo số lượng nhân viên
        const departments = await Department.findAll({
            attributes: [
                'id',
                'name',
                'description',
                'created_at',
                'updated_at',
                [
                    // Đếm số lượng nhân viên trong phòng ban
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM users
                        WHERE users.department_id = Department.id
                        AND users.role IN ('staff', 'admin')
                    )`),
                    'staff_count' // Tên trường mới
                ]
            ],
            order: [['name', 'ASC']] // Sắp xếp theo tên phòng ban
        });

        res.json(departments);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin các bộ phận với số lượng nhân viên:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin các bộ phận', error: error.message });
    }
};

const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, {
            attributes: [
                'id',
                'name',
                'description',
                'created_at',
                'updated_at',
                [
                    // Đếm số lượng nhân viên trong phòng ban
                    Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM users
                        WHERE users.department_id = Department.id
                        AND users.role IN ('staff', 'admin')
                    )`),
                    'staff_count' // Tên trường mới
                ]
            ]
        });

        if (!department) {
            return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
        }

        res.json(department);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bộ phận với số lượng nhân viên:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin phòng ban', error: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = await Department.create({ name, description });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo phòng ban', error: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
        }

        await department.update({ name, description });
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật phòng ban', error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
        }

        await department.destroy();
        res.json({ message: 'Xóa phòng ban thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa phòng ban', error: error.message });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};