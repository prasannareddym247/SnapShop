const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticateToken, checkSeller } = require('../middlewares/authMiddleware');

// Secure all routes with authentication
router.use(authenticateToken);

// Store Profile (Allowed for pending sellers to see status)
router.get('/profile', sellerController.getProfile);
router.put('/profile', sellerController.updateProfile);

// Read-only product listing allowed for pending sellers (to see their products)
router.get('/products', sellerController.getProducts);

// Announcements (visible to all sellers including pending)
router.get('/announcements', sellerController.getAnnouncements);

// Rest of the routes require approved seller verification
router.use(checkSeller);

// Product CRUD (write operations)
router.post('/products', sellerController.createProduct);
router.put('/products/:id', sellerController.updateProduct);
router.delete('/products/:id', sellerController.deleteProduct);

// Orders fulfillment
router.get('/orders', sellerController.getOrders);
router.put('/orders/:orderId/status', sellerController.updateOrderStatus);

// Coupons CRUD
router.get('/coupons', sellerController.getCoupons);
router.post('/coupons', sellerController.createCoupon);
router.delete('/coupons/:id', sellerController.deleteCoupon);

// Analytics & Queries
router.get('/analytics', sellerController.getAnalytics);
router.get('/customers', sellerController.getCustomers);
router.get('/customers/:customerId', sellerController.getCustomerDetail);
router.get('/inventory', sellerController.getInventory);
router.put('/inventory/stock', sellerController.updateStock);
router.get('/inventory/logs', sellerController.getInventoryHistory);
router.post('/inventory/adjust', sellerController.adjustStock);
router.get('/queries', sellerController.getQueries);
router.post('/queries/:id/reply', sellerController.replyToQuery);

module.exports = router;
