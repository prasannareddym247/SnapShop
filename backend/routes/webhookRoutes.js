const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/razorpay', webhookController.razorpayWebhook);
router.post('/stripe', webhookController.stripeWebhook);
router.post('/shipping', webhookController.shippingWebhook);

module.exports = router;
