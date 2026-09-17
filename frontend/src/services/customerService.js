import api from './api';

const customerService = {
  getWishlist() {
    return api.get('/customer/wishlist');
  },

  addToWishlist(productId) {
    return api.post('/customer/wishlist', { productId });
  },

  removeFromWishlist(productId) {
    return api.delete(`/customer/wishlist/${productId}`);
  },

  getProductReviews(productId) {
    return api.get(`/customer/products/${productId}/reviews`);
  },

  addReview(productId, rating, comment) {
    return api.post(`/customer/products/${productId}/reviews`, { rating, comment });
  },

  getAddresses() {
    return api.get('/customer/addresses');
  },

  addAddress(addressData) {
    return api.post('/customer/addresses', addressData);
  },

  deleteAddress(id) {
    return api.delete(`/customer/addresses/${id}`);
  },

  requestReturn(orderId, reason) {
    return api.post(`/customer/orders/${orderId}/return`, { reason });
  },

  getPaymentMethods() {
    return api.get('/customer/payments/methods');
  },

  getNotifications() {
    return api.get('/customer/notifications');
  },

  markNotificationRead(id) {
    return api.put(`/customer/notifications/${id}/read`);
  },

  markAllNotificationsRead() {
    return api.put('/customer/notifications/read-all');
  },

  getOrders() {
    return api.get('/orders/my-orders');
  }
};

export default customerService;
