const express = require('express');
const router = express.Router();
const formTemplateController = require('../controllers/formTemplateController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/', formTemplateController.getAllFormTemplates);
router.get('/:id', formTemplateController.getFormTemplateById);
router.get('/department/:department_id', formTemplateController.getFormTemplatesByDepartment);
// Protected routes - make sure to use the middleware function correctly
router.use(authenticate); // This line might be causing the error

// Admin only routes - make sure authorize is used correctly
router.post('/',
    authorize(['admin']),
    roleMiddleware(['admin', 'staff']), formTemplateController.createFormTemplate);
router.put('/:id', roleMiddleware(['admin', 'staff']), formTemplateController.updateFormTemplate);
router.delete('/:id', roleMiddleware(['admin']), formTemplateController.deleteFormTemplate);

module.exports = router;