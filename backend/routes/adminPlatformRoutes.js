const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middlewares/authMiddleware');
const adminPlatformController = require('../controllers/adminPlatformController');
const adminStoreController = require('../controllers/adminStoreController');
const adminSupportController = require('../controllers/adminSupportController');
const adminNotificationController = require('../controllers/adminNotificationController');

// All routes require authentication + Admin role
router.use(authenticateToken);
router.use(checkAdmin);

// ── Executive Dashboard ──
router.get('/dashboard/stats', adminPlatformController.getDashboardStats);

// ── Store Management ──
router.get('/stores', adminStoreController.getAllStores);
router.get('/stores/:id', adminStoreController.getStoreDetail);
router.put('/stores/:id/status', checkAdmin, adminStoreController.updateStoreStatus);
router.delete('/stores/:id', checkAdmin, adminStoreController.deleteStore);

// ── Support Tickets ──
router.get('/support/tickets', adminSupportController.getTickets);
router.get('/support/tickets/stats', adminSupportController.getTicketStats);
router.get('/support/tickets/:id', adminSupportController.getTicketDetail);
router.put('/support/tickets/:id', adminSupportController.updateTicket);
router.post('/support/tickets/:id/reply', adminSupportController.addReply);

// ── Announcements ──
router.get('/announcements', adminPlatformController.getAnnouncements);
router.post('/announcements', checkAdmin, adminPlatformController.createAnnouncement);
router.put('/announcements/:id', checkAdmin, adminPlatformController.updateAnnouncement);
router.delete('/announcements/:id', checkAdmin, adminPlatformController.deleteAnnouncement);

// ── Platform Settings ──
router.get('/settings', adminPlatformController.getSettings);
router.put('/settings', checkAdmin, adminPlatformController.updateSettings);

// ── System Health ──
router.get('/system/health', adminPlatformController.getSystemHealth);
router.get('/system/events', adminPlatformController.getSystemEvents);
router.put('/system/events/:id/resolve', checkAdmin, adminPlatformController.resolveSystemEvent);

// ── Reports ──
router.get('/reports/sales', adminPlatformController.getSalesReport);
router.get('/reports/sellers', adminPlatformController.getSellerReport);
router.get('/reports/products', adminPlatformController.getProductReport);
router.get('/reports/revenue', adminPlatformController.getRevenueReport);

// ── Audit Logs ──
router.get('/audit-logs', checkAdmin, adminPlatformController.getAuditLogs);

// ── Admin Notifications ──
router.get('/notifications', adminNotificationController.getNotifications);
router.get('/notifications/unread-count', adminNotificationController.getUnreadCount);
router.put('/notifications/:id/read', adminNotificationController.markRead);
router.put('/notifications/read-all', adminNotificationController.markAllRead);
router.delete('/notifications/:id', adminNotificationController.deleteNotification);

module.exports = router;
