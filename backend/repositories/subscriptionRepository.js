const db = require('../config/db');

const subscriptionRepository = {
  // ── Subscription Plans ──
  async getAllPlans() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().query('SELECT PlanId as id, PlanKey as [key], Name as name, Description as description, Price as price, Currency as currency, BillingCycle as billingCycle, TrialDays as trialDays, IsActive as isActive, IsRecommended as isRecommended, SortOrder as sortOrder, Features as features, CreatedAt as createdAt FROM SubscriptionPlans ORDER BY SortOrder');
      return res.recordset.map(p => ({ ...p, features: JSON.parse(p.features) }));
    }
    return [...localDb.subscriptionPlans].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getActivePlans() {
    const all = await this.getAllPlans();
    return all.filter(p => p.isActive);
  },

  async getPlanByKey(key) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('key', db.sql.NVarChar, key).query('SELECT PlanId as id, PlanKey as [key], Name as name, Description as description, Price as price, Currency as currency, BillingCycle as billingCycle, TrialDays as trialDays, IsActive as isActive, IsRecommended as isRecommended, SortOrder as sortOrder, Features as features, CreatedAt as createdAt FROM SubscriptionPlans WHERE PlanKey = @key');
      if (res.recordset.length === 0) return null;
      const p = res.recordset[0];
      return { ...p, features: JSON.parse(p.features) };
    }
    return localDb.subscriptionPlans.find(p => p.key === key) || null;
  },

  async createPlan(planData) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const featuresJson = JSON.stringify(planData.features || {});
    if (isSql) {
      const res = await pool.request()
        .input('key', db.sql.NVarChar, planData.key)
        .input('name', db.sql.NVarChar, planData.name)
        .input('desc', db.sql.NVarChar, planData.description || '')
        .input('price', db.sql.Decimal(10,2), planData.price || 0)
        .input('currency', db.sql.NVarChar, planData.currency || 'INR')
        .input('billingCycle', db.sql.NVarChar, planData.billingCycle || 'monthly')
        .input('trialDays', db.sql.Int, planData.trialDays || 0)
        .input('isActive', db.sql.Bit, planData.isActive !== false ? 1 : 0)
        .input('isRecommended', db.sql.Bit, planData.isRecommended ? 1 : 0)
        .input('sortOrder', db.sql.Int, planData.sortOrder || 0)
        .input('features', db.sql.NVarChar, featuresJson)
        .query('INSERT INTO SubscriptionPlans (PlanKey, Name, Description, Price, Currency, BillingCycle, TrialDays, IsActive, IsRecommended, SortOrder, Features) OUTPUT INSERTED.PlanId VALUES (@key, @name, @desc, @price, @currency, @billingCycle, @trialDays, @isActive, @isRecommended, @sortOrder, @features)');
      return res.recordset[0].PlanId;
    }
    const newId = localDb.subscriptionPlans.length > 0 ? Math.max(...localDb.subscriptionPlans.map(p => p.id)) + 1 : 1;
    localDb.subscriptionPlans.push({
      id: newId, key: planData.key, name: planData.name, description: planData.description || '',
      price: planData.price || 0, currency: planData.currency || 'INR',
      billingCycle: planData.billingCycle || 'monthly', trialDays: planData.trialDays || 0,
      isActive: planData.isActive !== false, isRecommended: !!planData.isRecommended,
      sortOrder: planData.sortOrder || 0, features: planData.features || {},
      createdAt: new Date().toISOString()
    });
    db.saveLocalDb();
    return newId;
  },

  async updatePlan(key, planData) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const featuresJson = planData.features ? JSON.stringify(planData.features) : null;
      let query = 'UPDATE SubscriptionPlans SET ';
      const updates = [];
      const inputs = [];
      if (planData.name !== undefined) { updates.push('Name = @name'); inputs.push({ name: 'name', type: db.sql.NVarChar, value: planData.name }); }
      if (planData.description !== undefined) { updates.push('Description = @desc'); inputs.push({ name: 'desc', type: db.sql.NVarChar, value: planData.description }); }
      if (planData.price !== undefined) { updates.push('Price = @price'); inputs.push({ name: 'price', type: db.sql.Decimal(10,2), value: planData.price }); }
      if (planData.isActive !== undefined) { updates.push('IsActive = @isActive'); inputs.push({ name: 'isActive', type: db.sql.Bit, value: planData.isActive ? 1 : 0 }); }
      if (planData.isRecommended !== undefined) { updates.push('IsRecommended = @isRecommended'); inputs.push({ name: 'isRecommended', type: db.sql.Bit, value: planData.isRecommended ? 1 : 0 }); }
      if (planData.sortOrder !== undefined) { updates.push('SortOrder = @sortOrder'); inputs.push({ name: 'sortOrder', type: db.sql.Int, value: planData.sortOrder }); }
      if (planData.trialDays !== undefined) { updates.push('TrialDays = @trialDays'); inputs.push({ name: 'trialDays', type: db.sql.Int, value: planData.trialDays }); }
      if (featuresJson) { updates.push('Features = @features'); inputs.push({ name: 'features', type: db.sql.NVarChar, value: featuresJson }); }
      if (updates.length === 0) return false;
      query += updates.join(', ') + ' WHERE PlanKey = @key';
      const req = pool.request().input('key', db.sql.NVarChar, key);
      inputs.forEach(i => req.input(i.name, i.type, i.value));
      await req.query(query);
      return true;
    }
    const idx = localDb.subscriptionPlans.findIndex(p => p.key === key);
    if (idx === -1) return false;
    Object.assign(localDb.subscriptionPlans[idx], planData);
    db.saveLocalDb();
    return true;
  },

  // ── Store Subscriptions ──
  async getStoreSubscription(storeId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('storeId', db.sql.Int, storeId).query('SELECT SubscriptionId as id, StoreId as storeId, TenantId as tenantId, PlanKey as planKey, Status as status, TrialStart as trialStart, TrialEnd as trialEnd, CurrentPeriodStart as currentPeriodStart, CurrentPeriodEnd as currentPeriodEnd, CancelledAt as cancelledAt, CreatedAt as createdAt, UpdatedAt as updatedAt, ExpiryNoticesSent as expiryNoticesSent FROM StoreSubscriptions WHERE StoreId = @storeId');
      return res.recordset.length > 0 ? res.recordset[0] : null;
    }
    const s = localDb.storeSubscriptions.find(s => s.storeId === parseInt(storeId));
    return s ? { ...s } : null;
  },

  async upsertSubscription(storeId, tenantId, data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const existing = await pool.request().input('storeId', db.sql.Int, storeId).query('SELECT SubscriptionId FROM StoreSubscriptions WHERE StoreId = @storeId');
      if (existing.recordset.length > 0) {
        await pool.request()
          .input('subscriptionId', db.sql.Int, existing.recordset[0].SubscriptionId)
          .input('planKey', db.sql.NVarChar, data.planKey)
          .input('status', db.sql.NVarChar, data.status || 'active')
          .input('trialStart', db.sql.DateTime, data.trialStart || null)
          .input('trialEnd', db.sql.DateTime, data.trialEnd || null)
          .input('periodStart', db.sql.DateTime, data.currentPeriodStart)
          .input('periodEnd', db.sql.DateTime, data.currentPeriodEnd)
          .input('cancelledAt', db.sql.DateTime, data.cancelledAt || null)
          .query('UPDATE StoreSubscriptions SET PlanKey = @planKey, Status = @status, TrialStart = @trialStart, TrialEnd = @trialEnd, CurrentPeriodStart = @periodStart, CurrentPeriodEnd = @periodEnd, CancelledAt = @cancelledAt, UpdatedAt = GETDATE() WHERE SubscriptionId = @subscriptionId');
      } else {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('planKey', db.sql.NVarChar, data.planKey)
          .input('status', db.sql.NVarChar, data.status || 'active')
          .input('trialStart', db.sql.DateTime, data.trialStart || null)
          .input('trialEnd', db.sql.DateTime, data.trialEnd || null)
          .input('periodStart', db.sql.DateTime, data.currentPeriodStart)
          .input('periodEnd', db.sql.DateTime, data.currentPeriodEnd)
          .input('cancelledAt', db.sql.DateTime, data.cancelledAt || null)
          .query('INSERT INTO StoreSubscriptions (StoreId, TenantId, PlanKey, Status, TrialStart, TrialEnd, CurrentPeriodStart, CurrentPeriodEnd, CancelledAt) VALUES (@storeId, @tenantId, @planKey, @status, @trialStart, @trialEnd, @periodStart, @periodEnd, @cancelledAt)');
      }
      return true;
    }
    const idx = localDb.storeSubscriptions.findIndex(s => s.storeId === parseInt(storeId));
    if (idx !== -1) {
      Object.assign(localDb.storeSubscriptions[idx], { ...data, updatedAt: new Date().toISOString() });
    } else {
      const newId = localDb.storeSubscriptions.length > 0 ? Math.max(...localDb.storeSubscriptions.map(s => s.id)) + 1 : 1;
      localDb.storeSubscriptions.push({
        id: newId, storeId: parseInt(storeId), tenantId: parseInt(tenantId),
        planKey: data.planKey, status: data.status || 'active',
        trialStart: data.trialStart || null, trialEnd: data.trialEnd || null,
        currentPeriodStart: data.currentPeriodStart, currentPeriodEnd: data.currentPeriodEnd,
        cancelledAt: data.cancelledAt || null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
    }
    db.saveLocalDb();
    return true;
  },

  async ensureSubscriptionsForAllStores() {
  },

  async getAllSubscriptions() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().query(
        `SELECT ss.SubscriptionId as id, st.StoreId as storeId, ss.TenantId as tenantId,
                ss.PlanKey as planKey, ss.Status as status,
                ss.TrialStart as trialStart, ss.TrialEnd as trialEnd,
                ss.CurrentPeriodStart as currentPeriodStart, ss.CurrentPeriodEnd as currentPeriodEnd,
                ss.CancelledAt as cancelledAt, ss.CreatedAt as createdAt, ss.UpdatedAt as updatedAt,
                ss.ExpiryNoticesSent as expiryNoticesSent,
                st.Name as storeName, st.Slug as storeSlug,
                st.CreatedAt as storeCreatedAt,
                u.UserId as ownerId, u.FirstName as ownerFirstName,
                u.LastName as ownerLastName, u.Email as ownerEmail, u.Phone as ownerPhone
         FROM Stores st
         LEFT JOIN StoreSubscriptions ss ON st.StoreId = ss.StoreId
         LEFT JOIN Users u ON st.OwnerId = u.UserId
         WHERE st.IsActive = 1 AND st.StoreId != 1 AND u.SellerStatus = 'Approved'
         ORDER BY COALESCE(ss.CurrentPeriodEnd, GETDATE()) ASC`
      );
      return res.recordset.map(r => {
        const created = new Date(r.storeCreatedAt);
        const startOfDay = new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate()));
        r.currentPeriodStart = startOfDay.toISOString();
        r.currentPeriodEnd = new Date(startOfDay.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
        if (!r.tenantId) r.tenantId = null;
        if (!r.status) r.status = null;
        if (!r.planKey) r.planKey = null;
        return { ...r, expiryNoticesSent: r.expiryNoticesSent || '[]' };
      });
    }
    const rawUsers = localDb.users || [];
    const allUsers = Array.isArray(rawUsers) ? rawUsers : (rawUsers.value || []);
    return localDb.stores
      .filter(st => {
        if (!st.isActive || st.id === 1) return false;
        const owner = allUsers.find(u => u.id === st.ownerId);
        return owner && owner.sellerStatus === 'Approved';
      })
      .map(st => {
        const s = localDb.storeSubscriptions.find(sub => sub.storeId === st.id);
        const owner = allUsers.find(u => u.id === st.ownerId);
        const created = new Date(st.createdAt);
        const startOfDay = new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate()));
        const periodStart = startOfDay.toISOString();
        const periodEnd = new Date(startOfDay.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
        return {
          id: s?.id || null,
          storeId: st.id,
          tenantId: s?.tenantId || st.tenantId || null,
          planKey: s?.planKey || null,
          status: s?.status || null,
          trialStart: s?.trialStart || periodStart,
          trialEnd: s?.trialEnd || periodEnd,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelledAt: s?.cancelledAt || null,
          createdAt: s?.createdAt || st.createdAt,
          updatedAt: s?.updatedAt || null,
          expiryNoticesSent: s?.expiryNoticesSent || '[]',
          storeName: st.name,
          storeSlug: st.slug,
          ownerId: owner?.id || null,
          ownerFirstName: owner?.firstName || '',
          ownerLastName: owner?.lastName || '',
          ownerEmail: owner?.email || '',
          ownerPhone: owner?.phone || ''
        };
      }).sort((a, b) => {
        const aEnd = a.currentPeriodEnd ? new Date(a.currentPeriodEnd) : new Date('9999-12-31');
        const bEnd = b.currentPeriodEnd ? new Date(b.currentPeriodEnd) : new Date('9999-12-31');
        return aEnd - bEnd;
      });
  },

  async getSubscriptionsByStatus(status) {
    const all = await this.getAllSubscriptions();
    return all.filter(s => s.status === status);
  },

  // ── Trial History ──
  async getTrialHistory(storeId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('storeId', db.sql.Int, storeId).query('SELECT TrialId as id, StoreId as storeId, TenantId as tenantId, PlanKey as planKey, StartedAt as startedAt, EndedAt as endedAt, ConvertedToPlan as convertedToPlan, Status as status, CreatedAt as createdAt FROM TrialHistory WHERE StoreId = @storeId ORDER BY StartedAt DESC');
      return res.recordset;
    }
    return localDb.trialHistory.filter(t => t.storeId === parseInt(storeId)).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  },

  async addTrialRecord(storeId, tenantId, planKey, startedAt, endedAt) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('tenantId', db.sql.Int, tenantId)
        .input('planKey', db.sql.NVarChar, planKey)
        .input('startedAt', db.sql.DateTime, startedAt)
        .input('endedAt', db.sql.DateTime, endedAt)
        .query('INSERT INTO TrialHistory (StoreId, TenantId, PlanKey, StartedAt, EndedAt) VALUES (@storeId, @tenantId, @planKey, @startedAt, @endedAt)');
      return true;
    }
    const newId = localDb.trialHistory.length > 0 ? Math.max(...localDb.trialHistory.map(t => t.id)) + 1 : 1;
    localDb.trialHistory.push({ id: newId, storeId: parseInt(storeId), tenantId: parseInt(tenantId), planKey, startedAt, endedAt, convertedToPlan: null, status: 'active', createdAt: new Date().toISOString() });
    db.saveLocalDb();
    return true;
  },

  async updateTrialStatus(storeId, status, convertedToPlan) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('status', db.sql.NVarChar, status)
        .input('convertedToPlan', db.sql.NVarChar, convertedToPlan || null)
        .query('UPDATE TrialHistory SET Status = @status, ConvertedToPlan = @convertedToPlan, EndedAt = GETDATE() WHERE StoreId = @storeId AND Status = \'active\'');
      return true;
    }
    const trials = localDb.trialHistory.filter(t => t.storeId === parseInt(storeId) && t.status === 'active');
    trials.forEach(t => { t.status = status; t.convertedToPlan = convertedToPlan || t.convertedToPlan; t.endedAt = new Date().toISOString(); });
    db.saveLocalDb();
    return true;
  },

  // ── Usage Metrics ──
  async getUsageMetrics(storeId, month) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('month', db.sql.NVarChar, month)
        .query('SELECT UsageId as id, StoreId as storeId, TenantId as tenantId, Month as month, ProductsUsed as productsUsed, OrdersThisMonth as ordersThisMonth, StorageUsedMB as storageUsedMB, ApiRequests as apiRequests, MediaCount as mediaCount FROM UsageMetrics WHERE StoreId = @storeId AND Month = @month');
      return res.recordset.length > 0 ? res.recordset[0] : null;
    }
    const m = localDb.usageMetrics.find(m => m.storeId === parseInt(storeId) && m.month === month);
    return m ? { ...m } : null;
  },

  async upsertUsageMetrics(storeId, tenantId, month, data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const existing = await pool.request().input('storeId', db.sql.Int, storeId).input('month', db.sql.NVarChar, month).query('SELECT UsageId FROM UsageMetrics WHERE StoreId = @storeId AND Month = @month');
      if (existing.recordset.length > 0) {
        let query = 'UPDATE UsageMetrics SET ';
        const sets = [];
        if (data.productsUsed !== undefined) sets.push('ProductsUsed = @productsUsed');
        if (data.ordersThisMonth !== undefined) sets.push('OrdersThisMonth = @ordersThisMonth');
        if (data.storageUsedMB !== undefined) sets.push('StorageUsedMB = @storageUsedMB');
        if (data.apiRequests !== undefined) sets.push('ApiRequests = @apiRequests');
        if (data.mediaCount !== undefined) sets.push('MediaCount = @mediaCount');
        if (sets.length === 0) return;
        query += sets.join(', ') + ' WHERE StoreId = @storeId AND Month = @month';
        const req = pool.request().input('storeId', db.sql.Int, storeId).input('month', db.sql.NVarChar, month);
        if (data.productsUsed !== undefined) req.input('productsUsed', db.sql.Int, data.productsUsed);
        if (data.ordersThisMonth !== undefined) req.input('ordersThisMonth', db.sql.Int, data.ordersThisMonth);
        if (data.storageUsedMB !== undefined) req.input('storageUsedMB', db.sql.Decimal(10,2), data.storageUsedMB);
        if (data.apiRequests !== undefined) req.input('apiRequests', db.sql.Int, data.apiRequests);
        if (data.mediaCount !== undefined) req.input('mediaCount', db.sql.Int, data.mediaCount);
        await req.query(query);
      } else {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('month', db.sql.NVarChar, month)
          .input('productsUsed', db.sql.Int, data.productsUsed || 0)
          .input('ordersThisMonth', db.sql.Int, data.ordersThisMonth || 0)
          .input('storageUsedMB', db.sql.Decimal(10,2), data.storageUsedMB || 0)
          .input('apiRequests', db.sql.Int, data.apiRequests || 0)
          .input('mediaCount', db.sql.Int, data.mediaCount || 0)
          .query('INSERT INTO UsageMetrics (StoreId, TenantId, Month, ProductsUsed, OrdersThisMonth, StorageUsedMB, ApiRequests, MediaCount) VALUES (@storeId, @tenantId, @month, @productsUsed, @ordersThisMonth, @storageUsedMB, @apiRequests, @mediaCount)');
      }
      return true;
    }
    const idx = localDb.usageMetrics.findIndex(m => m.storeId === parseInt(storeId) && m.month === month);
    if (idx !== -1) {
      Object.assign(localDb.usageMetrics[idx], data);
    } else {
      const newId = localDb.usageMetrics.length > 0 ? Math.max(...localDb.usageMetrics.map(m => m.id)) + 1 : 1;
      localDb.usageMetrics.push({ id: newId, storeId: parseInt(storeId), tenantId: parseInt(tenantId), month, productsUsed: data.productsUsed || 0, ordersThisMonth: data.ordersThisMonth || 0, storageUsedMB: data.storageUsedMB || 0, apiRequests: data.apiRequests || 0, mediaCount: data.mediaCount || 0, createdAt: new Date().toISOString() });
    }
    db.saveLocalDb();
    return true;
  },

  async getCurrentMonthUsage(storeId) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getUsageMetrics(storeId, month);
  },

  async getRevenueReport(startDate, endDate) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('start', db.sql.DateTime, startDate)
        .input('end', db.sql.DateTime, endDate)
        .query("SELECT COUNT(*) as totalInvoices, ISNULL(SUM(Total), 0) as totalRevenue, ISNULL(SUM(CASE WHEN Status='paid' THEN Total ELSE 0 END), 0) as collectedRevenue FROM BillingInvoices WHERE CreatedAt >= @start AND CreatedAt < @end");
      return res.recordset[0];
    }
    const invoices = localDb.billingInvoices.filter(i => {
      const d = new Date(i.createdAt);
      return d >= new Date(startDate) && d < new Date(endDate);
    });
    return {
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((s, i) => s + i.total, 0),
      collectedRevenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    };
  }
};

module.exports = subscriptionRepository;
