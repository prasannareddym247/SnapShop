const auditService = require('../services/auditService');
const announcementService = require('../services/announcementService');
const platformSettingsService = require('../services/platformSettingsService');
const systemHealthService = require('../services/systemHealthService');
const adminNotificationService = require('../services/adminNotificationService');
const reportService = require('../services/reportService');
const supportTicketService = require('../services/supportTicketService');
const userRepository = require('../repositories/userRepository');

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

const adminPlatformController = {
  // ── Executive Dashboard ──
  async getDashboardStats(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      const vendors = users.filter(u => u.role === 'Seller');
      const custs = users.filter(u => u.role === 'Customer');
      const sales = await reportService.getSalesReport();
      const tickets = await supportTicketService.getStats();
      const unreadNotifs = await adminNotificationService.getUnreadCount();
      res.json({
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalCustomers: custs.length,
        approvedVendors: vendors.filter(v => v.sellerStatus === 'Approved').length,
        pendingVendors: vendors.filter(v => v.sellerStatus === 'Pending').length,
        totalRevenue: sales.totalRevenue,
        totalOrders: sales.totalOrders,
        averageOrderValue: sales.averageOrderValue,
        openTickets: tickets.open + tickets.inProgress,
        criticalTickets: tickets.critical,
        unreadNotifications: unreadNotifs,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: 'Server error fetching dashboard stats.' });
    }
  },

  // ── Audit Logs ──
  async getAuditLogs(req, res) {
    try {
      const { action, userId, resourceType, limit, offset } = req.query;
      const logs = await auditService.getLogs({ action, userId, resourceType, limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 });
      res.json(logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      res.status(500).json({ error: 'Server error fetching audit logs.' });
    }
  },

  // ── Announcements ──
  async getAnnouncements(req, res) {
    try {
      const announcements = await announcementService.getAll();
      res.json(announcements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      res.status(500).json({ error: 'Server error fetching announcements.' });
    }
  },

  async createAnnouncement(req, res) {
    try {
      const { title, content, targetType, targetPlans, targetStoreIds, priority, status } = req.body;
      if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });
      const id = await announcementService.create({ title, content, targetType, targetPlans, targetStoreIds, priority, status }, req.user.id);
      await auditService.log('CREATE_ANNOUNCEMENT', req.user.id, req.user.email, { announcementId: id, title }, 'Announcement', id, getClientIp(req));
      res.status(201).json({ message: 'Announcement created.', id });
    } catch (err) {
      console.error('Error creating announcement:', err);
      res.status(500).json({ error: 'Server error creating announcement.' });
    }
  },

  async updateAnnouncement(req, res) {
    try {
      await announcementService.update(req.params.id, req.body);
      await auditService.log('UPDATE_ANNOUNCEMENT', req.user.id, req.user.email, { announcementId: req.params.id }, 'Announcement', req.params.id, getClientIp(req));
      res.json({ message: 'Announcement updated.' });
    } catch (err) {
      console.error('Error updating announcement:', err);
      res.status(500).json({ error: 'Server error updating announcement.' });
    }
  },

  async deleteAnnouncement(req, res) {
    try {
      await announcementService.delete(req.params.id);
      await auditService.log('DELETE_ANNOUNCEMENT', req.user.id, req.user.email, { announcementId: req.params.id }, 'Announcement', req.params.id, getClientIp(req));
      res.json({ message: 'Announcement deleted.' });
    } catch (err) {
      console.error('Error deleting announcement:', err);
      res.status(500).json({ error: 'Server error deleting announcement.' });
    }
  },

  // ── Platform Settings ──
  async getSettings(req, res) {
    try {
      const settings = await platformSettingsService.getAll();
      res.json(settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ error: 'Server error fetching settings.' });
    }
  },

  async updateSettings(req, res) {
    try {
      await platformSettingsService.setMultiple(req.body.settings);
      await auditService.log('UPDATE_PLATFORM_SETTINGS', req.user.id, req.user.email, { keys: Object.keys(req.body.settings) }, 'PlatformSettings', null, getClientIp(req));
      res.json({ message: 'Settings updated.' });
    } catch (err) {
      console.error('Error updating settings:', err);
      res.status(500).json({ error: 'Server error updating settings.' });
    }
  },

  // ── System Health ──
  async getSystemHealth(req, res) {
    try {
      const health = await systemHealthService.getHealth();
      res.json(health);
    } catch (err) {
      console.error('Error fetching system health:', err);
      res.status(500).json({ error: 'Server error fetching system health.' });
    }
  },

  async getSystemEvents(req, res) {
    try {
      const { severity, eventType, resolved } = req.query;
      const events = await systemHealthService.getEvents({ severity, eventType, resolved: resolved !== undefined ? resolved === 'true' : undefined });
      res.json(events);
    } catch (err) {
      console.error('Error fetching system events:', err);
      res.status(500).json({ error: 'Server error fetching system events.' });
    }
  },

  async resolveSystemEvent(req, res) {
    try {
      await systemHealthService.resolveEvent(req.params.id);
      await auditService.log('RESOLVE_SYSTEM_EVENT', req.user.id, req.user.email, { eventId: req.params.id }, 'SystemEvent', req.params.id, getClientIp(req));
      res.json({ message: 'Event resolved.' });
    } catch (err) {
      console.error('Error resolving system event:', err);
      res.status(500).json({ error: 'Server error resolving system event.' });
    }
  },

  // ── Reports ──
  async getSalesReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getSalesReport(startDate, endDate);
      res.json(report);
    } catch (err) {
      console.error('Error generating sales report:', err);
      res.status(500).json({ error: 'Server error generating sales report.' });
    }
  },

  async getSellerReport(req, res) {
    try {
      const report = await reportService.getSellerReport();
      res.json(report);
    } catch (err) {
      console.error('Error generating seller report:', err);
      res.status(500).json({ error: 'Server error generating seller report.' });
    }
  },

  async getProductReport(req, res) {
    try {
      const report = await reportService.getProductReport();
      res.json(report);
    } catch (err) {
      console.error('Error generating product report:', err);
      res.status(500).json({ error: 'Server error generating product report.' });
    }
  },

  async getRevenueReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getRevenueReport(startDate, endDate);
      res.json(report);
    } catch (err) {
      console.error('Error generating revenue report:', err);
      res.status(500).json({ error: 'Server error generating revenue report.' });
    }
  }
};

module.exports = adminPlatformController;
