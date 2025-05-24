const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadNotificationsCount);
router.put('/:id/read', notificationController.markNotificationAsRead);
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router; 