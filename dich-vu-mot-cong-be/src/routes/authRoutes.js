const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/profile', auth, authController.getProfile);

module.exports = router;
