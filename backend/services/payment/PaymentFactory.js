const RazorpayProvider = require('./RazorpayProvider');
const StripeProvider = require('./StripeProvider');
const CodProvider = require('./CodProvider');

const providers = {
  Razorpay: new RazorpayProvider(),
  Stripe: new StripeProvider(),
  COD: new CodProvider()
};

const PaymentFactory = {
  getProvider(methodName) {
    const provider = providers[methodName];
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${methodName}`);
    }
    return provider;
  }
};

module.exports = PaymentFactory;
