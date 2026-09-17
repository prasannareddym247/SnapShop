class ShippingStrategy {
  async calculateRates(origin, destination, weightGrams, credentials) {
    throw new Error('calculateRates must be implemented');
  }
  async createShipment(orderData, credentials) {
    throw new Error('createShipment must be implemented');
  }
}

module.exports = ShippingStrategy;
