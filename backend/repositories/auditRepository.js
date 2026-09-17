const db = require('../config/db');

const auditRepository = {
  async create(logEntry) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('userId', db.sql.Int, logEntry.userId || null)
        .input('userEmail', db.sql.NVarChar, logEntry.userEmail || null)
        .input('action', db.sql.NVarChar, logEntry.action)
        .input('resourceType', db.sql.NVarChar, logEntry.resourceType || null)
        .input('resourceId', db.sql.NVarChar, logEntry.resourceId || null)
        .input('details', db.sql.NVarChar, logEntry.details ? JSON.stringify(logEntry.details) : null)
        .input('ipAddress', db.sql.NVarChar, logEntry.ipAddress || null)
        .query(`INSERT INTO AuditLogs (UserId, UserEmail, Action, ResourceType, ResourceId, Details, IpAddress) 
                OUTPUT INSERTED.LogId VALUES (@userId, @userEmail, @action, @resourceType, @resourceId, @details, @ipAddress)`);
      return res.recordset[0].LogId;
    }
    const entry = { ...logEntry, logId: Date.now(), createdAt: new Date().toISOString() };
    localDb.auditLogs.push(entry);
    db.saveLocalDb();
    return entry.logId;
  },

  async getAll(filters = {}) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      let query = 'SELECT * FROM AuditLogs WHERE 1=1';
      const request = pool.request();
      if (filters.action) { query += ' AND Action = @action'; request.input('action', db.sql.NVarChar, filters.action); }
      if (filters.userId) { query += ' AND UserId = @userId'; request.input('userId', db.sql.Int, filters.userId); }
      if (filters.resourceType) { query += ' AND ResourceType = @resourceType'; request.input('resourceType', db.sql.NVarChar, filters.resourceType); }
      query += ' ORDER BY CreatedAt DESC';
      if (filters.limit) { query = query.replace(/ORDER BY/, `OFFSET ${filters.offset || 0} ROWS FETCH NEXT ${filters.limit} ROWS ONLY ORDER BY`); query = `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY CreatedAt DESC) AS rn FROM AuditLogs WHERE 1=1${filters.action ? ' AND Action = @action' : ''}${filters.userId ? ' AND UserId = @userId' : ''}${filters.resourceType ? ' AND ResourceType = @resourceType' : ''}) AS logs WHERE rn BETWEEN ${(filters.offset || 0) + 1} AND ${(filters.offset || 0) + filters.limit}`; }
      const res = await request.query(query);
      return res.recordset;
    }
    let logs = [...localDb.auditLogs].reverse();
    if (filters.action) logs = logs.filter(l => l.action === filters.action);
    if (filters.userId) logs = logs.filter(l => l.userId === parseInt(filters.userId));
    if (filters.resourceType) logs = logs.filter(l => l.resourceType === filters.resourceType);
    const offset = filters.offset || 0;
    const limit = filters.limit || logs.length;
    return logs.slice(offset, offset + limit);
  },

  async getRecent(limit = 50) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('limit', db.sql.Int, limit)
        .query('SELECT TOP (@limit) * FROM AuditLogs ORDER BY CreatedAt DESC');
      return res.recordset;
    }
    return [...localDb.auditLogs].reverse().slice(0, limit);
  }
};

module.exports = auditRepository;
