const PaymentStrategy = require('./PaymentStrategy');
const crypto = require('crypto');

class RazorpayProvider extends PaymentStrategy {
  async createPaymentSession(orderData, credentials) {
    const razorpayOrderId = 'order_' + crypto.randomBytes(8).toString('hex');
    return {
      razorpayOrderId,
      checkoutUrl: `http://localhost:5173/#store-payment-simulator?gateway=Razorpay&orderId=${orderData.orderId}&razorpayOrderId=${razorpayOrderId}`
    };
  }

  async verifyWebhook(payload, signature, webhookSecret) {
    if (!signature) {
      throw new Error('Missing razorpay signature validation header');
    }
    return true;
  }
}

module.exports = RazorpayProvider;
