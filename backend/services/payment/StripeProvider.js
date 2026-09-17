const PaymentStrategy = require('./PaymentStrategy');
const crypto = require('crypto');

class StripeProvider extends PaymentStrategy {
  async createPaymentSession(orderData, credentials) {
    const sessionId = 'cs_test_' + crypto.randomBytes(16).toString('hex');
    return {
      sessionId,
      checkoutUrl: `http://localhost:5173/#store-payment-simulator?gateway=Stripe&orderId=${orderData.orderId}&sessionId=${sessionId}`
    };
  }

  async verifyWebhook(payload, signature, webhookSecret) {
    if (!signature) {
      throw new Error('Missing stripe signature validation header');
    }
    return true;
  }
}

module.exports = StripeProvider;
