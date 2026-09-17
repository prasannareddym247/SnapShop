const express = require('express');
const router = express.Router();
const adminSubscriptionController = require('../controllers/adminSubscriptionController');
const { authenticateToken, checkAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(checkAdmin);

// Plan Management
router.get('/plans', adminSubscriptionController.getAllPlans);
router.post('/plans', adminSubscriptionController.createPlan);
router.put('/plans/:key', adminSubscriptionController.updatePlan);
router.delete('/plans/:key', adminSubscriptionController.archivePlan);

// Subscription Management
router.get('/subscriptions', adminSubscriptionController.getAllSubscriptions);
router.get('/subscriptions/stats', adminSubscriptionController.getSubscriptionStats);
router.get('/subscriptions/trials', adminSubscriptionController.getTrialStores);
router.get('/subscriptions/expiring', adminSubscriptionController.getExpiringStores);

// Expiry Check
router.post('/subscriptions/check-expiry', adminSubscriptionController.checkExpiryNotices);

// Revenue & Invoices
router.get('/revenue', adminSubscriptionController.getRevenueReport);
router.get('/invoices', adminSubscriptionController.getAllInvoices);
router.get('/payment-failures', adminSubscriptionController.getPaymentFailures);

module.exports = router;
