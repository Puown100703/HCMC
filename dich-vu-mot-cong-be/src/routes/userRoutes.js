const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(auth);

// Admin routes
router.get('/', checkRole('admin'), userController.getAllUsers);
router.get('/:id', checkRole('admin'), userController.getUserById);
router.post('/', checkRole('admin'), userController.createUser);
router.put('/:id', checkRole('admin'), userController.updateUser);
router.delete('/:id', checkRole('admin'), userController.deleteUser);
router.get('/department/:departmentId', checkRole('admin'), userController.getUsersByDepartment);

module.exports = router; 