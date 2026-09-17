const auditRepository = require('../repositories/auditRepository');

const auditService = {
  async log(action, userId, userEmail, details = {}, resourceType = null, resourceId = null, ipAddress = null) {
    return auditRepository.create({
      action,
      userId: userId || null,
      userEmail: userEmail || null,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ipAddress
    });
  },

  async getLogs(filters = {}) {
    return auditRepository.getAll(filters);
  },

  async getRecent(limit = 50) {
    return auditRepository.getRecent(limit);
  }
};

module.exports = auditService;
