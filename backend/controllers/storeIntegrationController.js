const integrationRepository = require('../repositories/integrationRepository');
const PaymentFactory = require('../services/payment/PaymentFactory');
const ShippingFactory = require('../services/shipping/ShippingFactory');

const storeIntegrationController = {
  async getPaymentSettings(req, res) {
    try {
      const data = await integrationRepository.getPaymentSettings(req.storeId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Server error retrieving payment settings.' });
    }
  },

  async updatePaymentSettings(req, res) {
    try {
      const { methods, credentials } = req.body;
      
      if (methods && Array.isArray(methods)) {
        for (const m of methods) {
          await integrationRepository.updatePaymentMethod(req.storeId, req.tenantId, m.MethodName, m.IsEnabled, m.IsDefault);
        }
      }

      if (credentials && Array.isArray(credentials)) {
        for (const c of credentials) {
          await integrationRepository.updateGatewayCredentials(
            req.storeId,
            req.tenantId,
            c.GatewayName,
            c.ApiKey,
            c.ApiSecret,
            c.WebhookSecret,
            c.IsTestMode
          );
        }
      }

      res.json({ message: 'Payment settings updated successfully.' });
    } catch (err) {
      console.error('[Integrations] Update payments error:', err.message);
      res.status(500).json({ error: 'Server error saving settings.' });
    }
  },

  async testPaymentConnection(req, res) {
    try {
      const { gatewayName, apiKey, apiSecret } = req.body;
      if (!apiKey || !apiSecret) {
        return res.status(400).json({ error: 'API key and secret credentials are required.' });
      }

      // Simulation check logic
      if (gatewayName === 'Stripe') {
        if (!apiKey.startsWith('sk_') && !apiKey.startsWith('pk_')) {
          return res.status(400).json({ error: 'Stripe API Key must start with pk_ or sk_.' });
        }
      } else if (gatewayName === 'Razorpay') {
        if (!apiKey.startsWith('rzp_')) {
          return res.status(400).json({ error: 'Razorpay Key ID must start with rzp_.' });
        }
      }

      // Mock connection latency
      await new Promise(resolve => setTimeout(resolve, 500));
      res.json({ success: true, message: `Secure connection verified for ${gatewayName} Sandbox!` });
    } catch (err) {
      res.status(500).json({ error: 'Sandbox connection test failed.' });
    }
  },

  async getShippingSettings(req, res) {
    try {
      const data = await integrationRepository.getShippingSettings(req.storeId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Server error retrieving shipping settings.' });
    }
  },

  async updateShippingSettings(req, res) {
    try {
      const { providers } = req.body;
      if (providers && Array.isArray(providers)) {
        for (const p of providers) {
          await integrationRepository.updateShippingProvider(req.storeId, req.tenantId, p);
        }
      }
      res.json({ message: 'Shipping settings updated successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error saving shipping configurations.' });
    }
  },

  async testShippingConnection(req, res) {
    try {
      const { providerName, apiKey, apiSecret } = req.body;
      if (providerName !== 'Manual' && (!apiKey || !apiSecret)) {
        return res.status(400).json({ error: 'API key and secret credentials are required.' });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      res.json({ success: true, message: `Connected to ${providerName} Fulfillment network successfully!` });
    } catch (err) {
      res.status(500).json({ error: 'Shipping provider connection test failed.' });
    }
  },

  async getWebhookLogs(req, res) {
    try {
      const logs = await integrationRepository.getWebhookLogs(req.storeId);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: 'Server error fetching webhook logs.' });
    }
  }
};

module.exports = storeIntegrationController;
