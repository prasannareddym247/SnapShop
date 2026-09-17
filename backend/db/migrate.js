const db = require('../config/db');
const logger = require('../logger');

const MIGRATIONS_TABLE = 'SchemaMigrations';

async function ensureMigrationsTable() {
  if (db.getUseSqlServer()) {
    const pool = db.getPool();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${MIGRATIONS_TABLE}' AND xtype='U')
      CREATE TABLE ${MIGRATIONS_TABLE} (MigrationId INT IDENTITY(1,1) PRIMARY KEY, MigrationName NVARCHAR(255) NOT NULL, AppliedAt DATETIME DEFAULT GETDATE())
    `);
  } else {
    const localDb = db.getLocalDb();
    if (!localDb.schemaMigrations) localDb.schemaMigrations = [];
    db.saveLocalDb();
  }
}

async function getAppliedMigrations() {
  if (db.getUseSqlServer()) {
    const pool = db.getPool();
    const res = await pool.request().query(`SELECT MigrationName FROM ${MIGRATIONS_TABLE} ORDER BY MigrationId`);
    return res.recordset.map(r => r.MigrationName);
  }
  return (db.getLocalDb().schemaMigrations || []).map(m => m.migrationName);
}

async function markApplied(name) {
  if (db.getUseSqlServer()) {
    const pool = db.getPool();
    await pool.request().input('name', db.sql.NVarChar, name).query(`INSERT INTO ${MIGRATIONS_TABLE} (MigrationName) VALUES (@name)`);
  } else {
    const localDb = db.getLocalDb();
    if (!localDb.schemaMigrations) localDb.schemaMigrations = [];
    localDb.schemaMigrations.push({ migrationName: name, appliedAt: new Date().toISOString() });
    db.saveLocalDb();
  }
}

const migrations = {
  '001_add_audit_logs_index': async () => {
    if (db.getUseSqlServer()) {
      const pool = db.getPool();
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_AuditLogs_Action') CREATE INDEX IX_AuditLogs_Action ON AuditLogs(Action)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_AuditLogs_CreatedAt') CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt DESC)");
    }
    logger.info('Migration 001: Audit logs indexes created');
  },
  '002_add_support_tickets_index': async () => {
    if (db.getUseSqlServer()) {
      const pool = db.getPool();
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_SupportTickets_Status') CREATE INDEX IX_SupportTickets_Status ON SupportTickets(Status)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_SupportTickets_Priority') CREATE INDEX IX_SupportTickets_Priority ON SupportTickets(Priority)");
    }
    logger.info('Migration 002: Support tickets indexes created');
  },
  '003_add_orders_index': async () => {
    if (db.getUseSqlServer()) {
      const pool = db.getPool();
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Orders_UserId') CREATE INDEX IX_Orders_UserId ON Orders(UserId)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Orders_Status') CREATE INDEX IX_Orders_Status ON Orders(OrderStatus)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Orders_CreatedAt') CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt DESC)");
    }
    logger.info('Migration 003: Orders indexes created');
  },
  '004_add_products_index': async () => {
    if (db.getUseSqlServer()) {
      const pool = db.getPool();
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Products_VendorId') CREATE INDEX IX_Products_VendorId ON Products(VendorId)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Products_CategoryId') CREATE INDEX IX_Products_CategoryId ON Products(CategoryId)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Products_Status') CREATE INDEX IX_Products_Status ON Products(Status)");
    }
    logger.info('Migration 004: Products indexes created');
  },
  '005_add_users_index': async () => {
    if (db.getUseSqlServer()) {
      const pool = db.getPool();
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Users_Email') CREATE INDEX IX_Users_Email ON Users(Email)");
      await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Users_Role') CREATE INDEX IX_Users_Role ON Users(Role)");
    }
    logger.info('Migration 005: Users indexes created');
  }
};

async function runMigrations() {
  logger.info('Running database migrations...');
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const keys = Object.keys(migrations).sort();
  let ran = 0;
  for (const key of keys) {
    if (!applied.includes(key)) {
      try {
        await migrations[key]();
        await markApplied(key);
        logger.info(`Migration applied: ${key}`);
        ran++;
      } catch (err) {
        logger.error(`Migration failed: ${key}`, { error: err.message });
        throw err;
      }
    }
  }
  logger.info(`Migrations complete. ${ran} new, ${applied.length} already applied.`);
  return { applied: applied.length, new: ran };
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  db.initDatabase().then(() => runMigrations()).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runMigrations };
