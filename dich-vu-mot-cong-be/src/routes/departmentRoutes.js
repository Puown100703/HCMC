const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const departmentController = require('../controllers/departmentController');

// All routes require authentication
router.use(auth);

// Public routes (authenticated users)
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin only routes
router.post('/', checkRole('admin'), departmentController.createDepartment);
router.put('/:id', checkRole('admin'), departmentController.updateDepartment);
router.delete('/:id', checkRole('admin'), departmentController.deleteDepartment);

module.exports = router; 