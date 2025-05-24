const { Feedback, SubmittedForm, User } = require('../models');

const createFeedback = async (req, res) => {
    try {
        const { submission_id, rating, comments } = req.body;

        const existingFeedback = await Feedback.findOne({
            where: { submission_id }
        });

        if (existingFeedback) {
            return res.status(400).json({ message: 'Phản hồi đã có cho bài nộp này' });
        }

        const submission = await SubmittedForm.findByPk(submission_id);

        if (!submission) {
            return res.status(404).json({ message: 'Không tìm thấy mẫu đã gửi' });
        }

        if (submission.student_id !== req.user.id) {
            return res.status(403).json({ message: 'Không được phép để lại phản hồi cho bài nộp này' });
        }

        const feedback = await Feedback.create({
            submission_id,
            student_id: req.user.id,
            rating,
            comments
        });

        const feedbackWithRelations = await Feedback.findByPk(feedback.id, {
            include: [
                { model: SubmittedForm },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        res.status(201).json(feedbackWithRelations);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo phản hồi', error: error.message });
    }
};

const getFeedbackBySubmission = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({
            where: { submission_id: req.params.submissionId },
            include: [
                { model: SubmittedForm },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        if (!feedback) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy phản hồi', error: error.message });
    }
};

const updateFeedback = async (req, res) => {
    try {
        const { rating, comments } = req.body;
        const feedback = await Feedback.findByPk(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }

        if (feedback.student_id !== req.user.id) {
            return res.status(403).json({ message: 'Không được phép cập nhật phản hồi này' });
        }

        await feedback.update({ rating, comments });

        const updatedFeedback = await Feedback.findByPk(feedback.id, {
            include: [
                { model: SubmittedForm },
                { model: User, as: 'student', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        res.json(updatedFeedback);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật phản hồi', error: error.message });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByPk(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }

        if (feedback.student_id !== req.user.id) {
            return res.status(403).json({ message: 'Không được phép xóa phản hồi này' });
        }

        await feedback.destroy();
        res.json({ message: 'Phản hồi đã được xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa phản hồi', error: error.message });
    }
};

const getDepartmentFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findAll({
            include: [
                {
                    model: SubmittedForm,
                    where: { department_id: req.params.departmentId },
                    include: [{ model: User, as: 'student', attributes: ['id', 'username', 'full_name'] }]
                }
            ]
        });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy phản hồi từ bộ phận', error: error.message });
    }
};

module.exports = {
    createFeedback,
    getFeedbackBySubmission,
    updateFeedback,
    deleteFeedback,
    getDepartmentFeedback
}; 