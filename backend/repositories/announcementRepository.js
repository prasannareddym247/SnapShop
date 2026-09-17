const db = require('../config/db');

const announcementRepository = {
  async create(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const now = new Date().toISOString();
    if (isSql) {
      const res = await pool.request()
        .input('title', db.sql.NVarChar, data.title)
        .input('content', db.sql.NVarChar, data.content)
        .input('targetType', db.sql.NVarChar, data.targetType || 'all_stores')
        .input('targetPlans', db.sql.NVarChar, data.targetPlans ? JSON.stringify(data.targetPlans) : null)
        .input('targetStoreIds', db.sql.NVarChar, data.targetStoreIds ? JSON.stringify(data.targetStoreIds) : null)
        .input('priority', db.sql.NVarChar, data.priority || 'normal')
        .input('status', db.sql.NVarChar, data.status || 'published')
        .input('createdBy', db.sql.Int, data.createdBy || null)
        .query(`INSERT INTO Announcements (Title, Content, TargetType, TargetPlans, TargetStoreIds, Priority, Status, CreatedBy) 
                OUTPUT INSERTED.AnnouncementId VALUES (@title, @content, @targetType, @targetPlans, @targetStoreIds, @priority, @status, @createdBy)`);
      return res.recordset[0].AnnouncementId;
    }
    const entry = { ...data, announcementId: Date.now(), createdAt: now, updatedAt: now };
    localDb.announcements.push(entry);
    db.saveLocalDb();
    return entry.announcementId;
  },

  async getAll() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().query('SELECT * FROM Announcements ORDER BY CreatedAt DESC');
      return res.recordset;
    }
    return [...localDb.announcements].reverse();
  },

  async getById(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('id', db.sql.Int, id).query('SELECT * FROM Announcements WHERE AnnouncementId = @id');
      return res.recordset[0] || null;
    }
    return localDb.announcements.find(a => a.announcementId === parseInt(id)) || null;
  },

  async update(id, data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const now = new Date().toISOString();
    if (isSql) {
      const request = pool.request().input('id', db.sql.Int, id);
      const setClauses = [];
      if (data.title !== undefined) { setClauses.push('Title=@title'); request.input('title', db.sql.NVarChar, data.title); }
      if (data.content !== undefined) { setClauses.push('Content=@content'); request.input('content', db.sql.NVarChar, data.content); }
      if (data.targetType !== undefined) { setClauses.push('TargetType=@targetType'); request.input('targetType', db.sql.NVarChar, data.targetType); }
      if (data.targetPlans !== undefined) { setClauses.push('TargetPlans=@targetPlans'); request.input('targetPlans', db.sql.NVarChar, data.targetPlans ? JSON.stringify(data.targetPlans) : null); }
      if (data.targetStoreIds !== undefined) { setClauses.push('TargetStoreIds=@targetStoreIds'); request.input('targetStoreIds', db.sql.NVarChar, data.targetStoreIds ? JSON.stringify(data.targetStoreIds) : null); }
      if (data.priority !== undefined) { setClauses.push('Priority=@priority'); request.input('priority', db.sql.NVarChar, data.priority); }
      if (data.status !== undefined) { setClauses.push('Status=@status'); request.input('status', db.sql.NVarChar, data.status); }
      if (setClauses.length > 0) {
        setClauses.push('UpdatedAt=GETDATE()');
        await request.query(`UPDATE Announcements SET ${setClauses.join(', ')} WHERE AnnouncementId=@id`);
      }
      return true;
    }
    const idx = localDb.announcements.findIndex(a => a.announcementId === parseInt(id));
    if (idx === -1) return false;
    localDb.announcements[idx] = { ...localDb.announcements[idx], ...data, updatedAt: now };
    db.saveLocalDb();
    return true;
  },

  async delete(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().input('id', db.sql.Int, id).query('DELETE FROM Announcements WHERE AnnouncementId=@id');
      return true;
    }
    const idx = localDb.announcements.findIndex(a => a.announcementId === parseInt(id));
    if (idx === -1) return false;
    localDb.announcements.splice(idx, 1);
    db.saveLocalDb();
    return true;
  }
};

module.exports = announcementRepository;
