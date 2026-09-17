import api from './api';

const subscriptionService = {
  async getMySubscription() {
    return api.get('/subscription/my');
  },
  async getPlans() {
    return api.get('/subscription/plans');
  },
  async upgradePlan(planKey) {
    return api.post('/subscription/upgrade', { planKey });
  },
  async downgradePlan(planKey) {
    return api.post('/subscription/downgrade', { planKey });
  },
  async cancelSubscription() {
    return api.post('/subscription/cancel');
  },
  async getMyInvoices() {
    return api.get('/subscription/invoices');
  },
  async getMyUsage() {
    return api.get('/subscription/usage');
  },
  async startTrial(planKey) {
    return api.post('/subscription/trial', { planKey });
  }
};

export default subscriptionService;
