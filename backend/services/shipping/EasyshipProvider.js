const ShippingStrategy = require('./ShippingStrategy');

class EasyshipProvider extends ShippingStrategy {
  async calculateRates(origin, destination, weightGrams, credentials) {
    return {
      providerName: 'Easyship Courier',
      rate: 90,
      estimatedDays: 4
    };
  }

  async createShipment(orderData, credentials) {
    return {
      trackingNumber: 'ES-' + Math.floor(1000000 + Math.random() * 9000000),
      courierName: 'DHL (via Easyship)',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Packed'
    };
  }
}

module.exports = EasyshipProvider;
