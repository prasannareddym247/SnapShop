const announcementRepository = require('../repositories/announcementRepository');
const platformSettingsRepository = require('../repositories/platformSettingsRepository');

const announcementService = {
  async create(data, userId) {
    const announcement = await announcementRepository.create({ ...data, createdBy: userId });
    return announcement;
  },

  async getAll() {
    return announcementRepository.getAll();
  },

  async getById(id) {
    return announcementRepository.getById(id);
  },

  async update(id, data) {
    return announcementRepository.update(id, data);
  },

  async delete(id) {
    return announcementRepository.delete(id);
  },

  async getActiveAnnouncements() {
    const all = await announcementRepository.getAll();
    return all.filter(a => (a.Status || a.status) === 'published');
  }
};

module.exports = announcementService;
