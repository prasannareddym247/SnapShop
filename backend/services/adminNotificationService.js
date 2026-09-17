const adminNotificationRepository = require('../repositories/adminNotificationRepository');

const adminNotificationService = {
  async create(type, title, message, priority = 'normal', referenceType = null, referenceId = null) {
    return adminNotificationRepository.create({ type, title, message, priority, referenceType, referenceId });
  },

  async getAll(filters = {}) {
    return adminNotificationRepository.getAll(filters);
  },

  async markRead(id) {
    return adminNotificationRepository.markRead(id);
  },

  async markAllRead() {
    return adminNotificationRepository.markAllRead();
  },

  async delete(id) {
    return adminNotificationRepository.delete(id);
  },

  async getUnreadCount() {
    const all = await adminNotificationRepository.getAll({ isRead: false });
    return all.length;
  }
};

module.exports = adminNotificationService;
