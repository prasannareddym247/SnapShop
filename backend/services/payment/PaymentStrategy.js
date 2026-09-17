class PaymentStrategy {
  async createPaymentSession(orderData, credentials) {
    throw new Error('createPaymentSession must be implemented');
  }
  async verifyWebhook(payload, signature, webhookSecret) {
    throw new Error('verifyWebhook must be implemented');
  }
}

module.exports = PaymentStrategy;
