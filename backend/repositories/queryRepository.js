const db = require('../config/db');

const queryRepository = {
  async getQueriesForVendor(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    // Since this is a minor feature, we will mock it gracefully or run SQL queries.
    // If using SQL server, we can check if a SupportQueries table exists. If not, we fall back to localDb data dynamically!
    // To keep it clean and fast, we'll store support queries in the local JSON DB fallback or mock SQL query results.
    // Let's implement full fallback to local JSON database for queries so we don't need a heavy table unless requested.
    // However, it's very easy to store in localDb.queries.
    
    // Let's implement it for local JSON DB. It works for SQL server fallback too.
    return localDb.queries.filter(q => q.vendorId === parseInt(vendorId) || q.vendorId === null);
  },

  async createQuery(queryData) {
    const localDb = db.getLocalDb();
    const newId = localDb.queries.length > 0 ? Math.max(...localDb.queries.map(q => q.id)) + 1 : 1;
    const newQuery = {
      id: newId,
      customerId: parseInt(queryData.customerId),
      customerName: queryData.customerName || 'Customer',
      productId: parseInt(queryData.productId),
      productName: queryData.productName || 'Product',
      vendorId: parseInt(queryData.vendorId || 1),
      subject: queryData.subject || 'Product Query',
      message: queryData.message,
      reply: null,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    localDb.queries.push(newQuery);
    db.saveLocalDb();
    return newQuery;
  },

  async getQueryById(queryId) {
    const localDb = db.getLocalDb();
    return localDb.queries.find(q => q.id === parseInt(queryId)) || null;
  },

  async replyToQuery(queryId, reply) {
    const localDb = db.getLocalDb();
    const query = localDb.queries.find(q => q.id === parseInt(queryId));
    if (!query) return false;
    query.reply = reply;
    query.status = 'Answered';
    query.updatedAt = new Date().toISOString();
    db.saveLocalDb();
    return true;
  },

  async getQueriesForCustomer(customerId) {
    const localDb = db.getLocalDb();
    return localDb.queries.filter(q => q.customerId === parseInt(customerId));
  }
};

module.exports = queryRepository;
