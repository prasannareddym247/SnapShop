const ManualShippingProvider = require('./ManualShippingProvider');
const ShiprocketProvider = require('./ShiprocketProvider');
const EasyshipProvider = require('./EasyshipProvider');

const providers = {
  Manual: new ManualShippingProvider(),
  Shiprocket: new ShiprocketProvider(),
  Easyship: new EasyshipProvider()
};

const ShippingFactory = {
  getProvider(providerName) {
    const provider = providers[providerName];
    if (!provider) {
      throw new Error(`Unsupported shipping provider: ${providerName}`);
    }
    return provider;
  }
};

module.exports = ShippingFactory;
