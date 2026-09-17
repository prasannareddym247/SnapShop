const adminNotificationService = require('../services/adminNotificationService');

const adminNotificationController = {
  async getNotifications(req, res) {
    try {
      const { isRead, type } = req.query;
      const notifications = await adminNotificationService.getAll({
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        type
      });
      const normalized = notifications.map(n => ({
        id: n.NotificationId || n.notificationId,
        type: n.Type || n.type,
        title: n.Title || n.title,
        message: n.Message || n.message,
        priority: n.Priority || n.priority,
        isRead: n.IsRead ?? n.isRead ?? false,
        referenceType: n.ReferenceType || n.referenceType,
        referenceId: n.ReferenceId || n.referenceId,
        createdAt: n.CreatedAt || n.createdAt
      }));
      res.json(normalized);
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      res.status(500).json({ error: 'Server error fetching notifications.' });
    }
  },

  async markRead(req, res) {
    try {
      await adminNotificationService.markRead(req.params.id);
      res.json({ message: 'Notification marked as read.' });
    } catch (err) {
      console.error('Error marking notification read:', err);
      res.status(500).json({ error: 'Server error marking notification read.' });
    }
  },

  async markAllRead(req, res) {
    try {
      await adminNotificationService.markAllRead();
      res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      res.status(500).json({ error: 'Server error marking notifications read.' });
    }
  },

  async deleteNotification(req, res) {
    try {
      await adminNotificationService.delete(req.params.id);
      res.json({ message: 'Notification deleted.' });
    } catch (err) {
      console.error('Error deleting notification:', err);
      res.status(500).json({ error: 'Server error deleting notification.' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await adminNotificationService.getUnreadCount();
      res.json({ count });
    } catch (err) {
      console.error('Error getting unread count:', err);
      res.status(500).json({ error: 'Server error getting unread count.' });
    }
  }
};

module.exports = adminNotificationController;
