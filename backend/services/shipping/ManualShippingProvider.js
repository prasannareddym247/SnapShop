const ShippingStrategy = require('./ShippingStrategy');

class ManualShippingProvider extends ShippingStrategy {
  async calculateRates(origin, destination, weightGrams, credentials) {
    return {
      providerName: 'Manual Shipping',
      rate: weightGrams > 2000 ? 100 : 50,
      estimatedDays: 3
    };
  }

  async createShipment(orderData, credentials) {
    return {
      trackingNumber: 'MAN-' + Math.floor(100000 + Math.random() * 900000),
      courierName: 'Merchant Fleet',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Packed'
    };
  }
}

module.exports = ManualShippingProvider;
