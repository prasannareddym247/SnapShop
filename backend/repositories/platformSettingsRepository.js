const db = require('../config/db');

const platformSettingsRepository = {
  async getAll() {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().query('SELECT * FROM PlatformSettings ORDER BY SettingKey');
      return res.recordset;
    }
    return [...(localDb.platformSettings || [])];
  },

  async getByKey(key) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('key', db.sql.NVarChar, key).query('SELECT * FROM PlatformSettings WHERE SettingKey = @key');
      return res.recordset[0] || null;
    }
    return (localDb.platformSettings || []).find(s => s.settingKey === key) || null;
  },

  async set(key, value, type = 'string', description = '') {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const existing = await this.getByKey(key);
    if (isSql) {
      if (existing) {
        await pool.request()
          .input('key', db.sql.NVarChar, key)
          .input('value', db.sql.NVarChar, String(value))
          .input('type', db.sql.NVarChar, type)
          .input('desc', db.sql.NVarChar, description)
          .query('UPDATE PlatformSettings SET SettingValue=@value, SettingType=@type, Description=@desc, UpdatedAt=GETDATE() WHERE SettingKey=@key');
      } else {
        await pool.request()
          .input('key', db.sql.NVarChar, key)
          .input('value', db.sql.NVarChar, String(value))
          .input('type', db.sql.NVarChar, type)
          .input('desc', db.sql.NVarChar, description)
          .query('INSERT INTO PlatformSettings (SettingKey, SettingValue, SettingType, Description) VALUES (@key, @value, @type, @desc)');
      }
      return true;
    }
    if (!localDb.platformSettings) localDb.platformSettings = [];
    const idx = localDb.platformSettings.findIndex(s => s.settingKey === key);
    const entry = { settingKey: key, settingValue: String(value), settingType: type, description, updatedAt: new Date().toISOString() };
    if (idx >= 0) localDb.platformSettings[idx] = entry;
    else localDb.platformSettings.push(entry);
    db.saveLocalDb();
    return true;
  },

  async delete(key) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      await pool.request().input('key', db.sql.NVarChar, key).query('DELETE FROM PlatformSettings WHERE SettingKey=@key');
      return true;
    }
    if (!localDb.platformSettings) return false;
    const idx = localDb.platformSettings.findIndex(s => s.settingKey === key);
    if (idx === -1) return false;
    localDb.platformSettings.splice(idx, 1);
    db.saveLocalDb();
    return true;
  }
};

module.exports = platformSettingsRepository;
