const db = require('../config/db');

const billingRepository = {
  async generateInvoiceNumber() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const year = new Date().getFullYear();
    if (isSql) {
      // Use a sequence table with atomic increment to avoid duplicates
      const seqRes = await pool.request()
        .input('seqName', db.sql.NVarChar, `invoice_${year}`)
        .query(`MERGE BillingSequences AS target
                USING (SELECT @seqName AS SeqName) AS source ON target.SeqName = source.SeqName
                WHEN MATCHED THEN UPDATE SET LastValue = LastValue + 1
                WHEN NOT MATCHED THEN INSERT (SeqName, LastValue) VALUES (@seqName, 1)
                OUTPUT INSERTED.LastValue AS NextValue;`);
      const nextVal = seqRes.recordset[0].NextValue;
      return `INV-${year}-${String(nextVal).padStart(5, '0')}`;
    } else {
      const count = localDb.billingInvoices.filter(i => i.invoiceNumber && i.invoiceNumber.startsWith(`INV-${year}-`)).length;
      return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
    }
  },

  async createInvoice(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, data.storeId)
        .input('tenantId', db.sql.Int, data.tenantId)
        .input('subscriptionId', db.sql.Int, data.subscriptionId || null)
        .input('invoiceNumber', db.sql.NVarChar, data.invoiceNumber)
        .input('planName', db.sql.NVarChar, data.planName)
        .input('amount', db.sql.Decimal(10,2), data.amount)
        .input('currency', db.sql.NVarChar, data.currency || 'INR')
        .input('tax', db.sql.Decimal(10,2), data.tax || 0)
        .input('total', db.sql.Decimal(10,2), data.total)
        .input('status', db.sql.NVarChar, data.status || 'pending')
        .input('billingAddress', db.sql.NVarChar, data.billingAddress ? JSON.stringify(data.billingAddress) : null)
        .input('periodStart', db.sql.DateTime, data.periodStart || null)
        .input('periodEnd', db.sql.DateTime, data.periodEnd || null)
        .query(`INSERT INTO BillingInvoices (StoreId, TenantId, SubscriptionId, InvoiceNumber, PlanName, Amount, Currency, Tax, Total, Status, BillingAddress, PeriodStart, PeriodEnd)
                OUTPUT INSERTED.InvoiceId
                VALUES (@storeId, @tenantId, @subscriptionId, @invoiceNumber, @planName, @amount, @currency, @tax, @total, @status, @billingAddress, @periodStart, @periodEnd)`);
      return res.recordset[0].InvoiceId;
    }
    const newId = localDb.billingInvoices.length > 0 ? Math.max(...localDb.billingInvoices.map(i => i.id)) + 1 : 1;
    localDb.billingInvoices.push({
      id: newId, storeId: parseInt(data.storeId), tenantId: parseInt(data.tenantId),
      subscriptionId: data.subscriptionId || null, invoiceNumber: data.invoiceNumber,
      planName: data.planName, amount: data.amount, currency: data.currency || 'INR',
      tax: data.tax || 0, total: data.total, status: data.status || 'pending',
      billingAddress: data.billingAddress || null, periodStart: data.periodStart || null,
      periodEnd: data.periodEnd || null, paidAt: null, paymentGateway: null,
      paymentTransactionId: null, invoicePdfUrl: null, createdAt: new Date().toISOString()
    });
    db.saveLocalDb();
    return newId;
  },

  async getInvoicesByStore(storeId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('storeId', db.sql.Int, storeId)
        .query('SELECT InvoiceId as id, StoreId as storeId, TenantId as tenantId, SubscriptionId as subscriptionId, InvoiceNumber as invoiceNumber, PlanName as planName, Amount as amount, Currency as currency, Tax as tax, Total as total, Status as status, BillingAddress as billingAddress, PeriodStart as periodStart, PeriodEnd as periodEnd, PaidAt as paidAt, PaymentGateway as paymentGateway, PaymentTransactionId as paymentTransactionId, InvoicePdfUrl as invoicePdfUrl, CreatedAt as createdAt FROM BillingInvoices WHERE StoreId = @storeId ORDER BY CreatedAt DESC');
      return res.recordset.map(i => ({ ...i, billingAddress: i.billingAddress ? JSON.parse(i.billingAddress) : null }));
    }
    return localDb.billingInvoices.filter(i => i.storeId === parseInt(storeId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getInvoiceById(invoiceId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('id', db.sql.Int, invoiceId)
        .query('SELECT InvoiceId as id, StoreId as storeId, TenantId as tenantId, SubscriptionId as subscriptionId, InvoiceNumber as invoiceNumber, PlanName as planName, Amount as amount, Currency as currency, Tax as tax, Total as total, Status as status, BillingAddress as billingAddress, PeriodStart as periodStart, PeriodEnd as periodEnd, PaidAt as paidAt, PaymentGateway as paymentGateway, PaymentTransactionId as paymentTransactionId, InvoicePdfUrl as invoicePdfUrl, CreatedAt as createdAt FROM BillingInvoices WHERE InvoiceId = @id');
      if (res.recordset.length === 0) return null;
      const i = res.recordset[0];
      return { ...i, billingAddress: i.billingAddress ? JSON.parse(i.billingAddress) : null };
    }
    const i = localDb.billingInvoices.find(i => i.id === parseInt(invoiceId));
    return i ? { ...i } : null;
  },

  async updateInvoiceStatus(invoiceId, status, paidAt, gateway, transactionId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request()
        .input('id', db.sql.Int, invoiceId)
        .input('status', db.sql.NVarChar, status)
        .input('paidAt', db.sql.DateTime, paidAt || null)
        .input('gateway', db.sql.NVarChar, gateway || null)
        .input('txnId', db.sql.NVarChar, transactionId || null)
        .query('UPDATE BillingInvoices SET Status = @status, PaidAt = @paidAt, PaymentGateway = @gateway, PaymentTransactionId = @txnId WHERE InvoiceId = @id');
      return true;
    }
    const idx = localDb.billingInvoices.findIndex(i => i.id === parseInt(invoiceId));
    if (idx === -1) return false;
    localDb.billingInvoices[idx].status = status;
    if (paidAt) localDb.billingInvoices[idx].paidAt = paidAt;
    if (gateway) localDb.billingInvoices[idx].paymentGateway = gateway;
    if (transactionId) localDb.billingInvoices[idx].paymentTransactionId = transactionId;
    db.saveLocalDb();
    return true;
  },

  async getAllInvoices(limit = 50) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().query(`SELECT TOP ${limit} i.InvoiceId as id, i.StoreId as storeId, i.InvoiceNumber as invoiceNumber, i.PlanName as planName, i.Amount as amount, i.Currency as currency, i.Tax as tax, i.Total as total, i.Status as status, i.PaidAt as paidAt, i.CreatedAt as createdAt, s.Name as storeName, s.Slug as storeSlug FROM BillingInvoices i LEFT JOIN Stores s ON i.StoreId = s.StoreId ORDER BY i.CreatedAt DESC`);
      return res.recordset;
    }
    return localDb.billingInvoices.slice(-limit).reverse().map(i => {
      const store = localDb.stores.find(s => s.id === i.storeId);
      return { ...i, storeName: store ? store.name : 'Unknown', storeSlug: store ? store.slug : '' };
    });
  },

  async recordPayment(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request()
        .input('storeId', db.sql.Int, data.storeId)
        .input('tenantId', db.sql.Int, data.tenantId)
        .input('invoiceId', db.sql.Int, data.invoiceId || null)
        .input('subscriptionId', db.sql.Int, data.subscriptionId || null)
        .input('gatewayName', db.sql.NVarChar, data.gatewayName)
        .input('transactionId', db.sql.NVarChar, data.transactionId)
        .input('amount', db.sql.Decimal(10,2), data.amount)
        .input('currency', db.sql.NVarChar, data.currency || 'INR')
        .input('paymentStatus', db.sql.NVarChar, data.paymentStatus)
        .input('gatewayResponse', db.sql.NVarChar, data.gatewayResponse ? JSON.stringify(data.gatewayResponse) : null)
        .query('INSERT INTO SubscriptionPayments (StoreId, TenantId, InvoiceId, SubscriptionId, GatewayName, TransactionId, Amount, Currency, PaymentStatus, GatewayResponse) VALUES (@storeId, @tenantId, @invoiceId, @subscriptionId, @gatewayName, @transactionId, @amount, @currency, @paymentStatus, @gatewayResponse)');
      return true;
    }
    const newId = localDb.subscriptionPayments.length > 0 ? Math.max(...localDb.subscriptionPayments.map(p => p.id)) + 1 : 1;
    localDb.subscriptionPayments.push({
      id: newId, storeId: parseInt(data.storeId), tenantId: parseInt(data.tenantId),
      invoiceId: data.invoiceId || null, subscriptionId: data.subscriptionId || null,
      gatewayName: data.gatewayName, transactionId: data.transactionId,
      amount: data.amount, currency: data.currency || 'INR',
      paymentStatus: data.paymentStatus, gatewayResponse: data.gatewayResponse || null,
      createdAt: new Date().toISOString()
    });
    db.saveLocalDb();
    return true;
  },

  async getPaymentsByStore(storeId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('storeId', db.sql.Int, storeId)
        .query('SELECT PaymentId as id, InvoiceId as invoiceId, SubscriptionId as subscriptionId, GatewayName as gatewayName, TransactionId as transactionId, Amount as amount, Currency as currency, PaymentStatus as paymentStatus, CreatedAt as createdAt FROM SubscriptionPayments WHERE StoreId = @storeId ORDER BY CreatedAt DESC');
      return res.recordset;
    }
    return localDb.subscriptionPayments.filter(p => p.storeId === parseInt(storeId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

module.exports = billingRepository;
