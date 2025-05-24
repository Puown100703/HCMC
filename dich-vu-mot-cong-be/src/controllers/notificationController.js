const { Notification, SubmittedForm } = require('../models');

const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            include: [{ model: SubmittedForm }],
            order: [['created_at', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this notification' });
        }

        await notification.update({ is_read: true });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this notification' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
};

const getUnreadNotificationsCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { user_id: req.user.id, is_read: false }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread notifications count', error: error.message });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationsCount
}; 