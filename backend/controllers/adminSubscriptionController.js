const subscriptionRepository = require('../repositories/subscriptionRepository');
const subscriptionService = require('../services/subscriptionService');
const billingRepository = require('../repositories/billingRepository');

const adminSubscriptionController = {
  async getAllPlans(req, res) {
    try {
      const plans = await subscriptionRepository.getAllPlans();
      res.json(plans);
    } catch (err) {
      console.error('[AdminSubscription] getAllPlans error:', err);
      res.status(500).json({ error: 'Failed to fetch plans.' });
    }
  },

  async createPlan(req, res) {
    try {
      const planData = req.body;
      if (!planData.key || !planData.name) return res.status(400).json({ error: 'Plan key and name are required.' });
      const existing = await subscriptionRepository.getPlanByKey(planData.key);
      if (existing) return res.status(400).json({ error: 'A plan with this key already exists.' });
      await subscriptionRepository.createPlan(planData);
      res.status(201).json({ message: 'Plan created successfully.' });
    } catch (err) {
      console.error('[AdminSubscription] createPlan error:', err);
      res.status(500).json({ error: 'Failed to create plan.' });
    }
  },

  async updatePlan(req, res) {
    try {
      const { key } = req.params;
      const planData = req.body;
      const existing = await subscriptionRepository.getPlanByKey(key);
      if (!existing) return res.status(404).json({ error: 'Plan not found.' });
      await subscriptionRepository.updatePlan(key, planData);
      res.json({ message: 'Plan updated successfully.' });
    } catch (err) {
      console.error('[AdminSubscription] updatePlan error:', err);
      res.status(500).json({ error: 'Failed to update plan.' });
    }
  },

  async archivePlan(req, res) {
    try {
      const { key } = req.params;
      await subscriptionRepository.updatePlan(key, { isActive: false });
      res.json({ message: 'Plan archived successfully.' });
    } catch (err) {
      console.error('[AdminSubscription] archivePlan error:', err);
      res.status(500).json({ error: 'Failed to archive plan.' });
    }
  },

  async getAllSubscriptions(req, res) {
    try {
      const data = await subscriptionService.getAllSubscriptionsWithPlans();
      res.json(data);
    } catch (err) {
      console.error('[AdminSubscription] getAllSubscriptions error:', err);
      res.status(500).json({ error: 'Failed to fetch subscriptions.' });
    }
  },

  async getSubscriptionStats(req, res) {
    try {
      const stats = await subscriptionService.getSubscriptionStats();
      res.json(stats);
    } catch (err) {
      console.error('[AdminSubscription] getSubscriptionStats error:', err);
      res.status(500).json({ error: 'Failed to fetch stats.' });
    }
  },

  async getRevenueReport(req, res) {
    try {
      const { start, end } = req.query;
      const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end ? new Date(end) : new Date();
      const report = await subscriptionRepository.getRevenueReport(startDate, endDate);
      res.json(report);
    } catch (err) {
      console.error('[AdminSubscription] getRevenueReport error:', err);
      res.status(500).json({ error: 'Failed to fetch revenue report.' });
    }
  },

  async getTrialStores(req, res) {
    try {
      const trials = await subscriptionService.getTrialStores();
      res.json(trials);
    } catch (err) {
      console.error('[AdminSubscription] getTrialStores error:', err);
      res.status(500).json({ error: 'Failed to fetch trial stores.' });
    }
  },

  async getExpiringStores(req, res) {
    try {
      const subs = await subscriptionRepository.getAllSubscriptions();
      const now = new Date();
      const expiring = subs.filter(s => {
        if (s.status !== 'active' && s.status !== 'trial') return false;
        const end = new Date(s.currentPeriodEnd);
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 14;
      });
      res.json(expiring);
    } catch (err) {
      console.error('[AdminSubscription] getExpiringStores error:', err);
      res.status(500).json({ error: 'Failed to fetch expiring stores.' });
    }
  },

  async checkExpiryNotices(req, res) {
    try {
      const result = await subscriptionService.checkAndSendExpiryNotices(req.user.id);
      res.json(result);
    } catch (err) {
      console.error('[AdminSubscription] checkExpiryNotices error:', err);
      res.status(500).json({ error: 'Failed to check expiry notices.' });
    }
  },

  async getAllInvoices(req, res) {
    try {
      const invoices = await billingRepository.getAllInvoices(100);
      res.json(invoices);
    } catch (err) {
      console.error('[AdminSubscription] getAllInvoices error:', err);
      res.status(500).json({ error: 'Failed to fetch invoices.' });
    }
  },

  async getPaymentFailures(req, res) {
    try {
      const invoices = await billingRepository.getAllInvoices(200);
      const failures = invoices.filter(i => i.status === 'failed');
      res.json(failures);
    } catch (err) {
      console.error('[AdminSubscription] getPaymentFailures error:', err);
      res.status(500).json({ error: 'Failed to fetch payment failures.' });
    }
  }
};

module.exports = adminSubscriptionController;
