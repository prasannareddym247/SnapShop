const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Get product reviews (Public route)
router.get('/products/:productId/reviews', customerController.getProductReviews);
router.get('/orders/:id', customerController.getOrderById);

// Secure routes with token verification
router.use(authenticateToken);

// Wishlist
router.get('/wishlist', customerController.getWishlist);
router.post('/wishlist', customerController.addToWishlist);
router.delete('/wishlist/:productId', customerController.removeFromWishlist);

// Add product review
router.post('/products/:productId/reviews', customerController.addReview);

// Saved Addresses
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', customerController.addAddress);
router.delete('/addresses/:id', customerController.deleteAddress);

// Return claims
router.post('/orders/:orderId/return', customerController.requestReturn);

// Payment Methods
router.get('/payments/methods', customerController.getPaymentMethods);

// System Notifications
router.get('/notifications', customerController.getNotifications);
router.put('/notifications/read-all', customerController.markAllNotificationsRead);
router.put('/notifications/:id/read', customerController.markNotificationRead);

// Customer Profile
router.put('/profile', customerController.updateProfile);

// Support queries
router.get('/queries', customerController.getQueries);
router.post('/queries', customerController.createQuery);

module.exports = router;
