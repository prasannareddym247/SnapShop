const supportTicketService = require('../services/supportTicketService');
const auditService = require('../services/auditService');

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

const adminSupportController = {
  async getTickets(req, res) {
    try {
      const { status, priority, category } = req.query;
      const tickets = await supportTicketService.getAll({ status, priority, category });
      res.json(tickets);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      res.status(500).json({ error: 'Server error fetching tickets.' });
    }
  },

  async getTicketDetail(req, res) {
    try {
      const ticket = await supportTicketService.getById(req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
      const replies = await supportTicketService.getReplies(req.params.id);
      res.json({ ...ticket, replies });
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
      res.status(500).json({ error: 'Server error fetching ticket detail.' });
    }
  },

  async updateTicket(req, res) {
    try {
      const { status, priority, assignedTo } = req.body;
      await supportTicketService.update(req.params.id, { status, priority, assignedTo });
      const uid = req.user.userId || req.user.id;
      await auditService.log('UPDATE_SUPPORT_TICKET', uid, req.user.email, { ticketId: req.params.id, status, priority, assignedTo }, 'SupportTicket', req.params.id, getClientIp(req));
      res.json({ message: 'Ticket updated.' });
    } catch (err) {
      console.error('Error updating ticket:', err);
      res.status(500).json({ error: 'Server error updating ticket.' });
    }
  },

  async addReply(req, res) {
    try {
      const { message, isInternal } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required.' });
      const uid = req.user.userId || req.user.id;
      const replyId = await supportTicketService.addReply(req.params.id, {
        userId: uid,
        userRole: req.user.role,
        message,
        isInternal: !!isInternal
      });
      await auditService.log('TICKET_REPLY', uid, req.user.email, { ticketId: req.params.id, replyId, isInternal: !!isInternal }, 'SupportTicket', req.params.id, getClientIp(req));
      res.status(201).json({ message: 'Reply added.', replyId });
    } catch (err) {
      console.error('Error adding reply:', err);
      res.status(500).json({ error: 'Server error adding reply.' });
    }
  },

  async getTicketStats(req, res) {
    try {
      const stats = await supportTicketService.getStats();
      res.json(stats);
    } catch (err) {
      console.error('Error fetching ticket stats:', err);
      res.status(500).json({ error: 'Server error fetching ticket stats.' });
    }
  }
};

module.exports = adminSupportController;
