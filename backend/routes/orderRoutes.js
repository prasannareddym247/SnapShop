const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/checkout', authenticateToken, orderController.checkout);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/invoice/:orderId', authenticateToken, orderController.getInvoice);

module.exports = router;
