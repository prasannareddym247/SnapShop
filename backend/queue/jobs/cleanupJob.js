const logger = require('../../logger');
const db = require('../../config/db');

async function handle(payload = {}) {
  const { olderThanDays = 90 } = payload;
  logger.info('Running cleanup job', { olderThanDays });
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
  if (db.getUseSqlServer()) {
    const pool = db.getPool();
    await pool.request()
      .input('cutoff', db.sql.NVarChar, cutoff)
      .query("DELETE FROM AuditLogs WHERE CreatedAt < @cutoff");
    await pool.request()
      .input('cutoff', db.sql.NVarChar, cutoff)
      .query("DELETE FROM SystemEvents WHERE CreatedAt < @cutoff AND Resolved = 1");
    await pool.request()
      .input('cutoff', db.sql.NVarChar, cutoff)
      .query("DELETE FROM AdminNotifications WHERE CreatedAt < @cutoff AND IsRead = 1");
    logger.info('Cleanup completed (SQL)');
  } else {
    const localDb = db.getLocalDb();
    const filterAndSave = (arr) => {
      const filtered = (arr || []).filter(x => new Date(x.createdAt || x.CreatedAt) > new Date(cutoff));
      return filtered;
    };
    localDb.auditLogs = filterAndSave(localDb.auditLogs);
    localDb.systemEvents = filterAndSave(localDb.systemEvents.filter(e => e.resolved));
    localDb.adminNotifications = filterAndSave((localDb.adminNotifications || []).filter(n => n.isRead));
    db.saveLocalDb();
    logger.info('Cleanup completed (JSON)');
  }
}

module.exports = { handle };
