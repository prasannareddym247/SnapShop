const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const logger = require('../logger');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupJson() {
  ensureBackupDir();
  const localDb = db.getLocalDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `snapshop-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(localDb, null, 2));
  logger.info(`JSON backup created: ${filepath} (${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB)`);
  return filepath;
}

async function backupSql() {
  if (!db.getUseSqlServer()) {
    logger.warn('SQL backup skipped — not using SQL Server');
    return null;
  }
  ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `snapshop-sql-backup-${timestamp}.bak`;
  const filepath = path.join(BACKUP_DIR, filename);
  try {
    const pool = db.getPool();
    await pool.request().query(`BACKUP DATABASE [${process.env.DB_NAME || 'SnapShop'}] TO DISK = N'${filepath}' WITH INIT, COMPRESSION`);
    logger.info(`SQL backup created: ${filepath}`);
    return filepath;
  } catch (err) {
    logger.error('SQL backup failed', { error: err.message });
    throw err;
  }
}

async function backup() {
  logger.info('Starting database backup...');
  const results = { json: null, sql: null };
  try { results.json = await backupJson(); } catch (err) { logger.error('JSON backup failed', { error: err.message }); }
  if (db.getUseSqlServer()) {
    try { results.sql = await backupSql(); } catch (err) { logger.error('SQL backup failed', { error: err.message }); }
  }
  logger.info('Backup complete', results);
  return results;
}

function listBackups() {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('snapshop-backup-') || f.startsWith('snapshop-sql-backup-'));
  return files.map(f => ({
    filename: f,
    sizeMB: (fs.statSync(path.join(BACKUP_DIR, f)).size / 1024 / 1024).toFixed(2),
    createdAt: fs.statSync(path.join(BACKUP_DIR, f)).mtime
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function restoreFromFile(filepath) {
  if (!fs.existsSync(filepath)) throw new Error(`Backup file not found: ${filepath}`);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const localDb = db.getLocalDb();
  Object.assign(localDb, data);
  db.saveLocalDb();
  logger.info(`Restored from: ${filepath}`);
  return true;
}

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const command = process.argv[2] || 'backup';
  db.initDatabase().then(() => {
    if (command === 'backup') return backup();
    if (command === 'list') return console.log(listBackups());
    if (command === 'restore') return restoreFromFile(process.argv[3]);
    console.log('Usage: node db/backup.js [backup|list|restore <file>]');
  }).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { backup, backupJson, backupSql, listBackups, restoreFromFile };
