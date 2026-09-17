import api from './api';

const sellerService = {
  getProfile() {
    return api.get('/seller/profile');
  },

  updateProfile(profileData) {
    return api.put('/seller/profile', profileData);
  },

  getProducts() {
    return api.get('/seller/products');
  },

  createProduct(productData) {
    return api.post('/seller/products', productData);
  },

  updateProduct(id, productData) {
    return api.put(`/seller/products/${id}`, productData);
  },

  deleteProduct(id) {
    return api.delete(`/seller/products/${id}`);
  },

  getOrders() {
    return api.get('/seller/orders');
  },

  updateOrderStatus(orderId, status, notes) {
    return api.put(`/seller/orders/${orderId}/status`, { status, notes });
  },

  getCoupons() {
    return api.get('/seller/coupons');
  },

  createCoupon(couponData) {
    return api.post('/seller/coupons', couponData);
  },

  deleteCoupon(id) {
    return api.delete(`/seller/coupons/${id}`);
  },

  getAnalytics() {
    return api.get('/seller/analytics');
  },

  getCustomers() {
    return api.get('/seller/customers');
  },

  getInventory() {
    return api.get('/seller/inventory');
  },

  updateStock(variantId, stock) {
    return api.put('/seller/inventory/stock', { variantId, stock });
  },

  getQueries() {
    return api.get('/seller/queries');
  },

  replyToQuery(id, reply) {
    return api.post(`/seller/queries/${id}/reply`, { reply });
  },

  // Store Management (Multi-Tenant)
  getMyStore() {
    return api.get('/stores/me');
  },

  updateStoreSettings(settings) {
    return api.put('/stores/settings', { settings });
  },

  updateStorePage(id, data) {
    return api.put(`/cms/pages/${id}`, data);
  },

  updateStoreProfile(data) {
    return api.put('/seller/profile', data);
  },

  getCustomerDetail(customerId) {
    return api.get(`/seller/customers/${customerId}`);
  },

  getInventoryLogs() {
    return api.get('/seller/inventory/logs');
  },

  adjustStock(variantId, adjustment, reason) {
    return api.post('/seller/inventory/adjust', { variantId, adjustment, reason });
  },

  getCategories() {
    return api.get('/categories');
  },

  createCategory(catData) {
    return api.post('/categories', catData);
  },

  updateCategory(id, catData) {
    return api.put(`/categories/${id}`, catData);
  },

  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  },

  getAnnouncements() {
    return api.get('/seller/announcements');
  }
};

export default sellerService;
