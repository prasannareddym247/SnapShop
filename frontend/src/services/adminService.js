import api from './api';

const adminService = {
  getUsers() {
    return api.get('/admin/users');
  },

  updateUserRole(id, role) {
    return api.put(`/admin/users/${id}/role`, { role });
  },

  getVendors() {
    return api.get('/admin/vendors');
  },

  approveVendor(id) {
    return api.put(`/admin/vendors/${id}/approve`);
  },

  rejectVendor(id) {
    return api.put(`/admin/vendors/${id}/reject`);
  },

  getAnalytics() {
    return api.get('/admin/analytics');
  },

  getCmsPages() {
    return api.get('/admin/cms');
  },

  saveCmsPage(slug, pageData) {
    return api.post(`/admin/cms/${slug}`, pageData);
  },

  getBanners() {
    return api.get('/admin/banners');
  },

  addBanner(bannerData) {
    return api.post('/admin/banners', bannerData);
  },

  deleteBanner(id) {
    return api.delete(`/admin/banners/${id}`);
  },

  getPendingProducts() {
    return api.get('/admin/pending-products');
  },

  bulkApproveProducts(productIds) {
    return api.put('/admin/products/bulk-approve', { productIds });
  },

  approveProduct(id) {
    return api.put(`/admin/products/${id}/approve`);
  },

  rejectProduct(id) {
    return api.put(`/admin/products/${id}/reject`);
  },

  requestProductChanges(id, reason) {
    return api.put(`/admin/products/${id}/request-changes`, { reason });
  },

  bulkUpload(products, vendorId) {
    return api.post('/admin/bulk-upload', { products, vendorId });
  },

  suspendVendor(id) {
    return api.put(`/admin/vendors/${id}/suspend`);
  },

  reactivateVendor(id) {
    return api.put(`/admin/vendors/${id}/reactivate`);
  },

  deleteVendor(id) {
    return api.delete(`/admin/vendors/${id}`);
  },

  getApprovedSellers() {
    return api.get('/admin/approved-sellers');
  },

  // ── Phase 9: Platform Administration ──
  // Dashboard
  getDashboardStats() {
    return api.get('/admin/dashboard/stats');
  },

  // Stores
  getStores() {
    return api.get('/admin/stores');
  },
  getStoreDetail(id) {
    return api.get(`/admin/stores/${id}`);
  },
  updateStoreStatus(id, status) {
    return api.put(`/admin/stores/${id}/status`, { status });
  },
  deleteStore(id) {
    return api.delete(`/admin/stores/${id}`);
  },

  // Support Tickets
  getSupportTickets(params = {}) {
    return api.get('/admin/support/tickets', params);
  },
  getSupportTicketDetail(id) {
    return api.get(`/admin/support/tickets/${id}`);
  },
  updateSupportTicket(id, data) {
    return api.put(`/admin/support/tickets/${id}`, data);
  },
  addSupportReply(id, message, isInternal = false) {
    return api.post(`/admin/support/tickets/${id}/reply`, { message, isInternal });
  },
  getSupportTicketStats() {
    return api.get('/admin/support/tickets/stats');
  },

  // Announcements
  getAnnouncements() {
    return api.get('/admin/announcements');
  },
  createAnnouncement(data) {
    return api.post('/admin/announcements', data);
  },
  updateAnnouncement(id, data) {
    return api.put(`/admin/announcements/${id}`, data);
  },
  deleteAnnouncement(id) {
    return api.delete(`/admin/announcements/${id}`);
  },

  // Platform Settings
  getSettings() {
    return api.get('/admin/settings');
  },
  updateSettings(settings) {
    return api.put('/admin/settings', { settings });
  },

  // System Health
  getSystemHealth() {
    return api.get('/admin/system/health');
  },
  getSystemEvents(params = {}) {
    return api.get('/admin/system/events', params);
  },
  resolveSystemEvent(id) {
    return api.put(`/admin/system/events/${id}/resolve`);
  },

  // Reports
  getSalesReport(params = {}) {
    return api.get('/admin/reports/sales', params);
  },
  getSellerReport() {
    return api.get('/admin/reports/sellers');
  },
  getProductReport() {
    return api.get('/admin/reports/products');
  },
  getRevenueReport(params = {}) {
    return api.get('/admin/reports/revenue', params);
  },

  // Audit Logs
  getAuditLogs(params = {}) {
    return api.get('/admin/audit-logs', params);
  },

  // Admin Notifications
  getAdminNotifications(params = {}) {
    return api.get('/admin/notifications', params);
  },
  getUnreadNotificationCount() {
    return api.get('/admin/notifications/unread-count');
  },
  markNotificationRead(id) {
    return api.put(`/admin/notifications/${id}/read`);
  },
  markAllNotificationsRead() {
    return api.put('/admin/notifications/read-all');
  },
  deleteAdminNotification(id) {
    return api.delete(`/admin/notifications/${id}`);
  }
};

export default adminService;
