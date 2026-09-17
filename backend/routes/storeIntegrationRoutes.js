const express = require('express');
const router = express.Router();
const storeIntegrationController = require('../controllers/storeIntegrationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/payments', authenticateToken, storeIntegrationController.getPaymentSettings);
router.put('/payments', authenticateToken, storeIntegrationController.updatePaymentSettings);
router.post('/payments/test', authenticateToken, storeIntegrationController.testPaymentConnection);
router.get('/shipping', authenticateToken, storeIntegrationController.getShippingSettings);
router.put('/shipping', authenticateToken, storeIntegrationController.updateShippingSettings);
router.post('/shipping/test', authenticateToken, storeIntegrationController.testShippingConnection);
router.get('/webhook-logs', authenticateToken, storeIntegrationController.getWebhookLogs);

module.exports = router;
