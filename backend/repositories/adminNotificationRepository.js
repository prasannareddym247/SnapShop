const db = require('../config/db');

const adminNotificationRepository = {
  async create(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('type', db.sql.NVarChar, data.type)
        .input('title', db.sql.NVarChar, data.title)
        .input('message', db.sql.NVarChar, data.message)
        .input('priority', db.sql.NVarChar, data.priority || 'normal')
        .input('referenceType', db.sql.NVarChar, data.referenceType || null)
        .input('referenceId', db.sql.NVarChar, data.referenceId || null)
        .query(`INSERT INTO AdminNotifications (Type, Title, Message, Priority, ReferenceType, ReferenceId) 
                OUTPUT INSERTED.NotificationId VALUES (@type, @title, @message, @priority, @referenceType, @referenceId)`);
      return res.recordset[0].NotificationId;
    }
    const entry = { ...data, notificationId: Date.now(), isRead: false, createdAt: new Date().toISOString() };
    if (!localDb.adminNotifications) localDb.adminNotifications = [];
    localDb.adminNotifications.push(entry);
    db.saveLocalDb();
    return entry.notificationId;
  },

  async getAll(filters = {}) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      let query = 'SELECT * FROM AdminNotifications WHERE 1=1';
      const request = pool.request();
      if (filters.isRead !== undefined) { query += ' AND IsRead = @isRead'; request.input('isRead', db.sql.Bit, filters.isRead ? 1 : 0); }
      if (filters.type) { query += ' AND Type = @type'; request.input('type', db.sql.NVarChar, filters.type); }
      query += ' ORDER BY CreatedAt DESC';
      const res = await request.query(query);
      return res.recordset;
    }
    let notifs = [...(localDb.adminNotifications || [])].reverse();
    if (filters.isRead !== undefined) notifs = notifs.filter(n => n.isRead === filters.isRead);
    if (filters.type) notifs = notifs.filter(n => n.type === filters.type);
    return notifs;
  },

  async markRead(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().input('id', db.sql.Int, id).query('UPDATE AdminNotifications SET IsRead=1 WHERE NotificationId=@id');
      return true;
    }
    const n = (localDb.adminNotifications || []).find(x => x.notificationId === parseInt(id));
    if (n) n.isRead = true;
    db.saveLocalDb();
    return true;
  },

  async markAllRead() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().query('UPDATE AdminNotifications SET IsRead=1 WHERE IsRead=0');
      return true;
    }
    (localDb.adminNotifications || []).forEach(n => n.isRead = true);
    db.saveLocalDb();
    return true;
  },

  async delete(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().input('id', db.sql.Int, id).query('DELETE FROM AdminNotifications WHERE NotificationId=@id');
      return true;
    }
    const arr = localDb.adminNotifications || [];
    const idx = arr.findIndex(x => x.notificationId === parseInt(id));
    if (idx >= 0) arr.splice(idx, 1);
    db.saveLocalDb();
    return true;
  }
};

module.exports = adminNotificationRepository;
