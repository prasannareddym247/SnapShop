const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Public
router.get('/plans', subscriptionController.getPlans);

// Authenticated (Store Owner)
router.get('/my', authenticateToken, subscriptionController.getMySubscription);
router.post('/upgrade', authenticateToken, subscriptionController.upgradePlan);
router.post('/downgrade', authenticateToken, subscriptionController.downgradePlan);
router.post('/cancel', authenticateToken, subscriptionController.cancelSubscription);
router.get('/invoices', authenticateToken, subscriptionController.getMyInvoices);
router.get('/usage', authenticateToken, subscriptionController.getMyUsage);
router.post('/trial', authenticateToken, subscriptionController.startTrial);

// Webhook (no auth - validated by payload)
router.post('/payment/webhook', subscriptionController.getSubscriptionWebhook);

module.exports = router;
