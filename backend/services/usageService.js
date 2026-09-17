const subscriptionRepository = require('../repositories/subscriptionRepository');
const db = require('../config/db');

const usageService = {
  async trackUsage(storeId, tenantId, resource, delta = 1) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const current = await subscriptionRepository.getUsageMetrics(storeId, month);
    const updates = {};
    updates[resource] = (current ? current[resource] : 0) + delta;
    await subscriptionRepository.upsertUsageMetrics(storeId, tenantId, month, updates);
  },

  async getStoreUsageSummary(storeId) {
    const subData = await subscriptionRepository.getStoreSubscription(storeId);
    const plan = subData ? await subscriptionRepository.getPlanByKey(subData.planKey) : null;
    const usage = await subscriptionRepository.getCurrentMonthUsage(storeId);
    const limits = plan ? plan.features || {} : {};
    const summary = {};
    if (usage) {
      summary.products = { used: usage.productsUsed || 0, limit: limits.maxProducts ?? -1 };
      summary.orders = { used: usage.ordersThisMonth || 0, limit: limits.maxOrdersPerMonth ?? -1 };
      summary.storage = { used: usage.storageUsedMB || 0, limit: limits.storageMB ?? -1 };
      summary.media = { used: usage.mediaCount || 0, limit: -1 };
    } else {
      const localDb = db.getLocalDb();
      const productsUsed = localDb.products.filter(p => p.storeId === parseInt(storeId)).length;
      const ordersThisMonth = localDb.orders.filter(o => {
        if (o.storeId !== parseInt(storeId)) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }).length;
      summary.products = { used: productsUsed, limit: limits.maxProducts ?? -1 };
      summary.orders = { used: ordersThisMonth, limit: limits.maxOrdersPerMonth ?? -1 };
      summary.storage = { used: 0, limit: limits.storageMB ?? -1 };
      summary.media = { used: 0, limit: -1 };
    }
    return { usage: summary, plan };
  },

  async checkFeatureAccess(storeId, feature) {
    const subData = await subscriptionRepository.getStoreSubscription(storeId);
    if (!subData) return { allowed: false, reason: 'No active subscription' };
    const plan = await subscriptionRepository.getPlanByKey(subData.planKey);
    if (!plan) return { allowed: false, reason: 'Plan not found' };
    const featureValue = plan.features ? plan.features[feature] : undefined;
    if (featureValue === undefined) return { allowed: false, reason: `Feature "${feature}" not defined` };
    if (featureValue === -1) return { allowed: true, reason: null };
    if (featureValue === false) return { allowed: false, reason: `Upgrade to access ${feature}` };
    if (featureValue === true) return { allowed: true, reason: null };
    if (typeof featureValue === 'number') return { allowed: true, reason: null };
    return { allowed: false, reason: `Upgrade to access ${feature}` };
  }
};

module.exports = usageService;
