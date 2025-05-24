const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const submittedFormController = require('../controllers/submittedFormController');

// All routes require authentication
router.use(auth);

// Student routes
router.post('/', submittedFormController.createSubmittedForm);
router.get('/my-submissions', submittedFormController.getSubmittedFormsByStudent);

// Staff and admin routes
router.get('/', checkRole('admin', 'staff'), submittedFormController.getAllSubmittedForms);
router.get('/department/:departmentId', checkRole('admin', 'staff'), submittedFormController.getSubmittedFormsByDepartment);
router.get('/student/:studentId', submittedFormController.getSubmittedFormsByStudentId); // API mới để lấy hồ sơ theo student_id
router.get('/:id', checkRole('admin', 'staff', 'student'), submittedFormController.getSubmittedFormById);
router.put('/:id', checkRole('admin', 'staff'), submittedFormController.updateSubmittedForm);
router.delete('/:id', checkRole('admin', 'staff'), submittedFormController.deleteSubmittedForm);

module.exports = router;