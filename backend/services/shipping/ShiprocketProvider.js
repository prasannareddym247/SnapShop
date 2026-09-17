const ShippingStrategy = require('./ShippingStrategy');

class ShiprocketProvider extends ShippingStrategy {
  async calculateRates(origin, destination, weightGrams, credentials) {
    const baseRate = 60;
    const weightSurcharge = Math.ceil(weightGrams / 500) * 15;
    return {
      providerName: 'Shiprocket Pro',
      rate: baseRate + weightSurcharge,
      estimatedDays: 2
    };
  }

  async createShipment(orderData, credentials) {
    return {
      trackingNumber: 'SR-' + Math.floor(100000000 + Math.random() * 900000000),
      courierName: 'BlueDart (via Shiprocket)',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Packed'
    };
  }
}

module.exports = ShiprocketProvider;
