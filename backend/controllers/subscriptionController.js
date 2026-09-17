const subscriptionService = require('../services/subscriptionService');
const billingService = require('../services/billingService');
const usageService = require('../services/usageService');
const subscriptionRepository = require('../repositories/subscriptionRepository');

const subscriptionController = {
  async getMySubscription(req, res) {
    try {
      const storeId = req.storeId;
      if (!storeId) return res.status(400).json({ error: 'Store context not resolved.' });
      const data = await subscriptionService.getStoreSubscriptionWithPlan(storeId);
      if (!data) return res.json({ subscription: null, plan: null, usage: null });
      res.json(data);
    } catch (err) {
      console.error('[Subscription] getMySubscription error:', err);
      res.status(500).json({ error: 'Failed to fetch subscription details.' });
    }
  },

  async getPlans(req, res) {
    try {
      const plans = await subscriptionRepository.getActivePlans();
      res.json(plans);
    } catch (err) {
      console.error('[Subscription] getPlans error:', err);
      res.status(500).json({ error: 'Failed to fetch plans.' });
    }
  },

  async upgradePlan(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { planKey } = req.body;
      if (!planKey) return res.status(400).json({ error: 'Plan key is required.' });
      const result = await subscriptionService.upgradePlan(storeId, tenantId, planKey);
      res.json({ message: `Upgraded to ${result.plan.name} successfully.`, ...result });
    } catch (err) {
      console.error('[Subscription] upgradePlan error:', err);
      res.status(400).json({ error: err.message || 'Failed to upgrade plan.' });
    }
  },

  async downgradePlan(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { planKey } = req.body;
      if (!planKey) return res.status(400).json({ error: 'Plan key is required.' });
      const result = await subscriptionService.downgradePlan(storeId, tenantId, planKey);
      res.json({ message: `Downgraded to ${result.plan.name}.`, ...result });
    } catch (err) {
      console.error('[Subscription] downgradePlan error:', err);
      res.status(400).json({ error: err.message || 'Failed to downgrade plan.' });
    }
  },

  async cancelSubscription(req, res) {
    try {
      const storeId = req.storeId;
      await subscriptionService.cancelSubscription(storeId);
      res.json({ message: 'Subscription cancelled successfully.' });
    } catch (err) {
      console.error('[Subscription] cancelSubscription error:', err);
      res.status(400).json({ error: err.message || 'Failed to cancel subscription.' });
    }
  },

  async getMyInvoices(req, res) {
    try {
      const storeId = req.storeId;
      const data = await billingService.getStoreBilling(storeId);
      res.json(data);
    } catch (err) {
      console.error('[Subscription] getMyInvoices error:', err);
      res.status(500).json({ error: 'Failed to fetch billing details.' });
    }
  },

  async getMyUsage(req, res) {
    try {
      const storeId = req.storeId;
      const summary = await usageService.getStoreUsageSummary(storeId);
      res.json(summary);
    } catch (err) {
      console.error('[Subscription] getMyUsage error:', err);
      res.status(500).json({ error: 'Failed to fetch usage metrics.' });
    }
  },

  async startTrial(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { planKey } = req.body;
      if (!planKey) return res.status(400).json({ error: 'Plan key is required.' });
      const result = await subscriptionService.startTrial(storeId, tenantId, planKey);
      if (!result) return res.status(400).json({ error: 'This plan does not offer a trial.' });
      res.json({ message: 'Trial started successfully.', ...result });
    } catch (err) {
      console.error('[Subscription] startTrial error:', err);
      res.status(500).json({ error: err.message || 'Failed to start trial.' });
    }
  },

  async getSubscriptionWebhook(req, res) {
    try {
      const { event, transactionId, invoiceNumber, status, amount, currency } = req.body;
      const result = await billingService.handlePaymentWebhook({ event, transactionId, invoiceNumber, status, amount, currency }, req.body.gateway || 'Razorpay');
      if (result.handled) {
        res.json({ received: true, invoiceId: result.invoiceId });
      } else {
        res.status(202).json({ received: true, handled: false });
      }
    } catch (err) {
      console.error('[Subscription] webhook error:', err);
      res.status(500).json({ error: 'Webhook processing failed.' });
    }
  }
};

module.exports = subscriptionController;
