const PaymentStrategy = require('./PaymentStrategy');

class CodProvider extends PaymentStrategy {
  async createPaymentSession(orderData, credentials) {
    return {
      checkoutUrl: null,
      status: 'Paid'
    };
  }

  async verifyWebhook(payload, signature, webhookSecret) {
    return true;
  }
}

module.exports = CodProvider;
