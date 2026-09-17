const db = require('../config/db');

const systemEventRepository = {
  async create(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('eventType', db.sql.NVarChar, data.eventType)
        .input('severity', db.sql.NVarChar, data.severity || 'info')
        .input('source', db.sql.NVarChar, data.source || null)
        .input('message', db.sql.NVarChar, data.message)
        .input('details', db.sql.NVarChar, data.details ? JSON.stringify(data.details) : null)
        .query(`INSERT INTO SystemEvents (EventType, Severity, Source, Message, Details) 
                OUTPUT INSERTED.EventId VALUES (@eventType, @severity, @source, @message, @details)`);
      return res.recordset[0].EventId;
    }
    const entry = { ...data, eventId: Date.now(), resolved: false, resolvedAt: null, createdAt: new Date().toISOString() };
    localDb.systemEvents.push(entry);
    db.saveLocalDb();
    return entry.eventId;
  },

  async getAll(filters = {}) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      let query = 'SELECT * FROM SystemEvents WHERE 1=1';
      const request = pool.request();
      if (filters.severity) { query += ' AND Severity = @severity'; request.input('severity', db.sql.NVarChar, filters.severity); }
      if (filters.eventType) { query += ' AND EventType = @eventType'; request.input('eventType', db.sql.NVarChar, filters.eventType); }
      if (filters.resolved !== undefined) { query += ' AND Resolved = @resolved'; request.input('resolved', db.sql.Bit, filters.resolved ? 1 : 0); }
      query += ' ORDER BY CreatedAt DESC';
      const res = await request.query(query);
      return res.recordset;
    }
    let events = [...localDb.systemEvents].reverse();
    if (filters.severity) events = events.filter(e => e.severity === filters.severity);
    if (filters.eventType) events = events.filter(e => e.eventType === filters.eventType);
    if (filters.resolved !== undefined) events = events.filter(e => e.resolved === filters.resolved);
    return events;
  },

  async resolve(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().input('id', db.sql.Int, id).query("UPDATE SystemEvents SET Resolved=1, ResolvedAt=GETDATE() WHERE EventId=@id");
      return true;
    }
    const event = localDb.systemEvents.find(e => e.eventId === parseInt(id));
    if (!event) return false;
    event.resolved = true;
    event.resolvedAt = new Date().toISOString();
    db.saveLocalDb();
    return true;
  }
};

module.exports = systemEventRepository;
