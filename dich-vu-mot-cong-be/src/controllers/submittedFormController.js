const { SubmittedForm, FormTemplate, User, Department, Notification } = require('../models');
const { sendStatusUpdateEmail } = require('../services/emailService');

const getAllSubmittedForms = async (req, res) => {
    try {
        const submissions = await SubmittedForm.findAll({
            include: [
                { model: FormTemplate },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] },
                { model: Department }
            ]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submitted forms', error: error.message });
    }
};

const getSubmittedFormById = async (req, res) => {
    try {
        const submission = await SubmittedForm.findByPk(req.params.id, {
            include: [
                { model: FormTemplate },
                { model: Department, attributes: ['id', 'name'] },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] },
            ]
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submitted form not found' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submitted form', error: error.message });
    }
};

const createSubmittedForm = async (req, res) => {
    try {
        const { template_id, html_content, department_id } = req.body;
        console.log("id", req.user.id)
        const submission = await SubmittedForm.create({
            template_id,
            student_id: req.user.id,
            html_content,
            department_id,
            status: 'pending'
        });

        // Create notification for department staff
        // await Notification.create({
        //     user_id: department_id, // This will need to be updated to notify specific staff
        //     submission_id: submission.id,
        //     message: 'New form submission received',
        //     type: 'app'
        // });

        const submissionWithRelations = await SubmittedForm.findByPk(submission.id, {
            include: [
                { model: FormTemplate },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] },
                { model: Department }
            ]
        });

        res.status(201).json(submissionWithRelations);
    } catch (error) {
        res.status(500).json({ message: 'Error creating submitted form', error: error.message });
    }
};

const updateSubmittedForm = async (req, res) => {
    try {
        const { status, assigned_staff_id, comments } = req.body;
        const submission = await SubmittedForm.findByPk(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submitted form not found' });
        }

        await submission.update({
            status,
            assigned_staff_id,
            comments
        });

        // Create notification for student
        await Notification.create({
            user_id: submission.student_id,
            submission_id: submission.id,
            message: `Your form submission status has been updated to ${status}`,
            type: 'app'
        });

        // Lấy thông tin đầy đủ của hồ sơ để gửi email
        const updatedSubmission = await SubmittedForm.findByPk(submission.id, {
            include: [
                { model: FormTemplate },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name', 'email'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] },
                { model: Department }
            ]
        });

        // Gửi email thông báo cho sinh viên
        try {
            await sendStatusUpdateEmail(
                updatedSubmission,
                updatedSubmission.student,
                updatedSubmission.FormTemplate,
                updatedSubmission.assignedStaff,
                updatedSubmission.Department
            );
        } catch (emailError) {
            console.error('Lỗi khi gửi email thông báo:', emailError);
            // Không trả về lỗi cho client, chỉ ghi log lỗi
        }

        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Error updating submitted form', error: error.message });
    }
};

const deleteSubmittedForm = async (req, res) => {
    try {
        const submission = await SubmittedForm.findByPk(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submitted form not found' });
        }

        await submission.destroy();
        res.json({ message: 'Submitted form deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting submitted form', error: error.message });
    }
};

const getSubmittedFormsByStudent = async (req, res) => {
    try {
        const submissions = await SubmittedForm.findAll({
            where: { student_id: req.user.id },
            include: [
                { model: FormTemplate },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] },
                { model: Department }
            ]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student submitted forms', error: error.message });
    }
};

const getSubmittedFormsByDepartment = async (req, res) => {
    try {
        const submissions = await SubmittedForm.findAll({
            where: { department_id: req.params.departmentId },
            include: [
                { model: FormTemplate },
                { model: Department },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] }
            ]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department submitted forms', error: error.message });
    }
};

const getSubmittedFormsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Kiểm tra quyền: chỉ admin và staff mới có thể xem hồ sơ của sinh viên khác
        if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.id !== parseInt(studentId)) {
            return res.status(403).json({ message: 'Không có quyền truy cập hồ sơ của sinh viên khác' });
        }

        const submissions = await SubmittedForm.findAll({
            where: { student_id: studentId },
            include: [
                { model: FormTemplate },
                { model: User, as: 'assignedStaff', attributes: ['id', 'username', 'full_name'] },
                { model: Department },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name', 'email'] }
            ],
            order: [['submitted_at', 'DESC']] // Sắp xếp theo thời gian nộp, mới nhất lên đầu
        });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách hồ sơ của sinh viên',
            error: error.message
        });
    }
};

module.exports = {
    getAllSubmittedForms,
    getSubmittedFormById,
    createSubmittedForm,
    updateSubmittedForm,
    deleteSubmittedForm,
    getSubmittedFormsByStudent,
    getSubmittedFormsByDepartment,
    getSubmittedFormsByStudentId
};