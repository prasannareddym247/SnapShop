const supportTicketRepository = require('../repositories/supportTicketRepository');

const supportTicketService = {
  async create(data) {
    return supportTicketRepository.create(data);
  },

  async getAll(filters = {}) {
    return supportTicketRepository.getAll(filters);
  },

  async getById(id) {
    return supportTicketRepository.getById(id);
  },

  async update(id, data) {
    return supportTicketRepository.update(id, data);
  },

  async addReply(ticketId, data) {
    return supportTicketRepository.addReply(ticketId, data);
  },

  async getReplies(ticketId) {
    return supportTicketRepository.getReplies(ticketId);
  },

  async getStats() {
    const all = await supportTicketRepository.getAll();
    return {
      total: all.length,
      open: all.filter(t => t.status === 'open').length,
      inProgress: all.filter(t => t.status === 'in_progress').length,
      resolved: all.filter(t => t.status === 'resolved').length,
      closed: all.filter(t => t.status === 'closed').length,
      critical: all.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length
    };
  }
};

module.exports = supportTicketService;
