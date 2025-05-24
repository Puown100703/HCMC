const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const feedbackController = require('../controllers/feedbackController');

// All routes require authentication
router.use(auth);

// Student routes
router.post('/', feedbackController.createFeedback);
router.put('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

// Public routes (authenticated users)
router.get('/submission/:submissionId', feedbackController.getFeedbackBySubmission);

// Staff and admin routes
router.get('/department/:departmentId', checkRole('admin', 'staff'), feedbackController.getDepartmentFeedback);

module.exports = router; 