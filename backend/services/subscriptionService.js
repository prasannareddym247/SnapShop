const subscriptionRepository = require('../repositories/subscriptionRepository');
const billingRepository = require('../repositories/billingRepository');
const adminNotificationRepository = require('../repositories/adminNotificationRepository');
const db = require('../config/db');

const subscriptionService = {
  async getStoreSubscriptionWithPlan(storeId) {
    const sub = await subscriptionRepository.getStoreSubscription(storeId);
    if (!sub) return null;
    const plan = await subscriptionRepository.getPlanByKey(sub.planKey);
    const usage = await this.calculateCurrentUsage(storeId);
    return { subscription: sub, plan, usage };
  },

  async startTrial(storeId, tenantId, planKey) {
    const plan = await subscriptionRepository.getPlanByKey(planKey);
    if (!plan || plan.trialDays <= 0) return null;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
    await subscriptionRepository.addTrialRecord(storeId, tenantId, planKey, now.toISOString(), trialEnd.toISOString());
    await subscriptionRepository.upsertSubscription(storeId, tenantId, {
      planKey, status: 'trial',
      trialStart: now.toISOString(), trialEnd: trialEnd.toISOString(),
      currentPeriodStart: now.toISOString(), currentPeriodEnd: trialEnd.toISOString()
    });
    return { trialStart: now, trialEnd };
  },

  async upgradePlan(storeId, tenantId, newPlanKey) {
    const plan = await subscriptionRepository.getPlanByKey(newPlanKey);
    if (!plan || !plan.isActive) throw new Error('Plan not found or inactive');
    const existing = await subscriptionRepository.getStoreSubscription(storeId);
    if (existing && existing.status === 'trial') {
      await subscriptionRepository.updateTrialStatus(storeId, 'converted', newPlanKey);
    }
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await subscriptionRepository.upsertSubscription(storeId, tenantId, {
      planKey: newPlanKey, status: 'active',
      trialStart: existing?.trialStart || null, trialEnd: existing?.trialEnd || null,
      currentPeriodStart: now.toISOString(), currentPeriodEnd: periodEnd.toISOString(),
      cancelledAt: null
    });
    const invoiceNumber = await billingRepository.generateInvoiceNumber();
    const total = plan.price;
    const tax = Math.round(total * 0.18 * 100) / 100;
    await billingRepository.createInvoice({
      storeId, tenantId, invoiceNumber, planName: plan.name,
      amount: plan.price, total: total + tax, tax,
      status: 'pending', periodStart: now.toISOString(), periodEnd: periodEnd.toISOString()
    });
    adminNotificationRepository.create({
      type: 'InvoiceGenerated',
      title: 'Invoice Generated',
      message: `Invoice ${invoiceNumber} generated for ${plan.name} plan upgrade (Store #${storeId})`,
      priority: 'normal'
    }).catch(() => {});
    return { plan, periodEnd };
  },

  async downgradePlan(storeId, tenantId, newPlanKey) {
    const plan = await subscriptionRepository.getPlanByKey(newPlanKey);
    if (!plan || !plan.isActive) throw new Error('Plan not found or inactive');
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await subscriptionRepository.upsertSubscription(storeId, tenantId, {
      planKey: newPlanKey, status: 'active',
      currentPeriodStart: now.toISOString(), currentPeriodEnd: periodEnd.toISOString(),
      cancelledAt: null
    });
    const invoiceNumber = await billingRepository.generateInvoiceNumber();
    const total = plan.price;
    const tax = Math.round(total * 0.18 * 100) / 100;
    await billingRepository.createInvoice({
      storeId, tenantId, invoiceNumber, planName: plan.name,
      amount: plan.price, total: total + tax, tax,
      status: 'pending', periodStart: now.toISOString(), periodEnd: periodEnd.toISOString()
    });
    adminNotificationRepository.create({
      type: 'InvoiceGenerated',
      title: 'Invoice Generated',
      message: `Invoice ${invoiceNumber} generated for ${plan.name} plan downgrade (Store #${storeId})`,
      priority: 'normal'
    }).catch(() => {});
    return { plan, periodEnd };
  },

  async cancelSubscription(storeId) {
    const existing = await subscriptionRepository.getStoreSubscription(storeId);
    if (!existing) throw new Error('No active subscription');
    await subscriptionRepository.upsertSubscription(storeId, existing.tenantId, {
      planKey: existing.planKey, status: 'cancelled',
      currentPeriodStart: existing.currentPeriodStart, currentPeriodEnd: existing.currentPeriodEnd,
      cancelledAt: new Date().toISOString()
    });
    return { cancelledAt: new Date() };
  },

  async calculateCurrentUsage(storeId) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const usage = await subscriptionRepository.getCurrentMonthUsage(storeId);
    if (usage) return usage;
    const localDb = require('../config/db').getLocalDb();
    const productsUsed = localDb.products.filter(p => p.storeId === parseInt(storeId)).length;
    const ordersThisMonth = localDb.orders.filter(o => {
      if (o.storeId !== parseInt(storeId)) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const mediaCount = (localDb.mediaLibrary || []).filter(m => m.storeId === parseInt(storeId)).length;
    await subscriptionRepository.upsertUsageMetrics(storeId, null, month, { productsUsed, ordersThisMonth, storageUsedMB: 0, apiRequests: 0, mediaCount });
    return { productsUsed, ordersThisMonth, storageUsedMB: 0, apiRequests: 0, mediaCount, month };
  },

  async checkPlanLimit(storeId, resource, currentValue) {
    const subData = await this.getStoreSubscriptionWithPlan(storeId);
    if (!subData || !subData.plan) return { allowed: true, limit: -1, current: currentValue };
    const featureValue = subData.plan.features ? subData.plan.features[resource] : undefined;
    if (featureValue === undefined || featureValue === -1) return { allowed: true, limit: -1, current: currentValue };
    return { allowed: currentValue < featureValue, limit: featureValue, current: currentValue };
  },

  async getAllSubscriptionsWithPlans() {
    const subs = await subscriptionRepository.getAllSubscriptions();
    const plans = await subscriptionRepository.getAllPlans();
    return subs.map(s => {
      const plan = plans.find(p => p.key === s.planKey);
      return { ...s, plan: plan || null };
    });
  },

  async getSubscriptionStats() {
    const subs = await subscriptionRepository.getAllSubscriptions();
    const total = subs.length;
    const active = subs.filter(s => s.status === 'active' || s.status === 'trial').length;
    const trial = subs.filter(s => s.status === 'trial').length;
    const cancelled = subs.filter(s => s.status === 'cancelled').length;
    const pastDue = subs.filter(s => s.status === 'past_due').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    const now = new Date();
    const expiringSoon = subs.filter(s => {
      if (s.status !== 'active' && s.status !== 'trial') return false;
      const end = new Date(s.currentPeriodEnd);
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const plans = await subscriptionRepository.getAllPlans();
    const planBreakdown = plans.map(p => ({
      key: p.key, name: p.name, count: subs.filter(s => s.planKey === p.key).length
    }));
    return { total, active, trial, cancelled, pastDue, expired, expiringSoon, planBreakdown };
  },

  async getTrialStores() {
    const trials = await subscriptionRepository.getSubscriptionsByStatus('trial');
    const plans = await subscriptionRepository.getAllPlans();
    return trials.map(t => {
      const plan = plans.find(p => p.key === t.planKey);
      return { ...t, plan: plan || null };
    });
  },

  async checkAndSendExpiryNotices(adminUserId) {
    const subs = await subscriptionRepository.getAllSubscriptions();
    const discussionRepo = require('../repositories/discussionRepository');
    const results = [];
    const now = new Date();
    for (const sub of subs) {
      if (sub.status !== 'active' && sub.status !== 'trial') continue;
      const end = new Date(sub.currentPeriodEnd);
      const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      const noticesSent = (() => { try { return JSON.parse(sub.expiryNoticesSent || '[]'); } catch (e) { return []; } })();
      const pending = [];
      if (daysRemaining <= 0 && !noticesSent.includes('expired')) pending.push({ level: 'expired', message: 'Your subscription has expired. Please renew your plan immediately to restore access.' });
      else if (daysRemaining <= 1 && !noticesSent.includes('1d')) pending.push({ level: '1d', message: 'Urgent: Your subscription expires tomorrow. Renew now to avoid losing access to your store.' });
      else if (daysRemaining <= 3 && !noticesSent.includes('3d')) pending.push({ level: '3d', message: `Reminder: Your subscription expires in ${daysRemaining} days. Please complete payment to continue using your store services.` });
      else if (daysRemaining <= 7 && !noticesSent.includes('7d')) pending.push({ level: '7d', message: 'Your subscription will expire in 7 days. Please renew your plan to avoid service interruption.' });
      if (pending.length > 0) {
        const sellerId = sub.ownerId || sub.storeId;
        for (const p of pending) {
          try {
            await discussionRepo.createMessage({
              senderId: adminUserId || 1,
              senderRole: 'Admin',
              message: p.message,
              sellerId: sellerId,
              productId: null
            });
            noticesSent.push(p.level);
          } catch (err) {
            console.error(`Failed to send expiry notice for store ${sub.storeId}:`, err);
          }
        }
        if (noticesSent.length > 0) {
          try {
            const pool = require('../config/db').getPool();
            const isSql = require('../config/db').getUseSqlServer();
            if (isSql && pool) {
              await pool.request()
                .input('storeId', db.sql.Int, sub.storeId)
                .input('notices', db.sql.NVarChar, JSON.stringify(noticesSent))
                .query('UPDATE StoreSubscriptions SET ExpiryNoticesSent = @notices, UpdatedAt = GETDATE() WHERE StoreId = @storeId');
            } else {
              const localDb = require('../config/db').getLocalDb();
              const idx = localDb.storeSubscriptions.findIndex(s => s.storeId === parseInt(sub.storeId));
              if (idx !== -1) {
                localDb.storeSubscriptions[idx].expiryNoticesSent = JSON.stringify(noticesSent);
                require('../config/db').saveLocalDb();
              }
            }
          } catch (err) {
            console.error(`Failed to update expiry notices for store ${sub.storeId}:`, err);
          }
        }
        results.push({ storeId: sub.storeId, storeName: sub.storeName, sent: pending.map(p => p.level) });
      }
    }
    return { checked: subs.length, sent: results };
  }
};

module.exports = subscriptionService;
