const db = require('../config/db');

const notificationRepository = {
  async getNotifications(userId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const query = userId 
        ? 'SELECT NotificationId as id, UserId as userId, Message as message, Type as type, IsRead as isRead, CreatedAt as createdAt FROM Notifications WHERE UserId = @userId ORDER BY CreatedAt DESC'
        : 'SELECT NotificationId as id, UserId as userId, Message as message, Type as type, IsRead as isRead, CreatedAt as createdAt FROM Notifications WHERE UserId IS NULL ORDER BY CreatedAt DESC';
      
      const req = pool.request();
      if (userId) req.input('userId', db.sql.Int, userId);
      
      const res = await req.query(query);
      return res.recordset;
    } else {
      const list = localDb.notifications || [];
      const filtered = userId 
        ? list.filter(n => n.userId === parseInt(userId))
        : list.filter(n => n.userId === null);
      
      return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createNotification(data) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const userId = data.userId ? parseInt(data.userId) : null;
    const message = data.message;
    const type = data.type || 'System';

    if (useSqlServer) {
      await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('message', db.sql.NVarChar, message)
        .input('type', db.sql.NVarChar, type)
        .query('INSERT INTO Notifications (UserId, Message, Type, IsRead) VALUES (@userId, @message, @type, 0)');
      return true;
    } else {
      if (!localDb.notifications) localDb.notifications = [];
      const newId = localDb.notifications.length > 0 ? Math.max(...localDb.notifications.map(n => n.id)) + 1 : 1;
      localDb.notifications.push({
        id: newId,
        userId,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return true;
    }
  },

  async markAsRead(notificationId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, notificationId)
        .query('UPDATE Notifications SET IsRead = 1 WHERE NotificationId = @id');
      return true;
    } else {
      const n = (localDb.notifications || []).find(n => n.id === parseInt(notificationId));
      if (n) {
        n.isRead = true;
        db.saveLocalDb();
      }
      return true;
    }
  },

  async markAllAsRead(userId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const query = userId
        ? 'UPDATE Notifications SET IsRead = 1 WHERE UserId = @userId'
        : 'UPDATE Notifications SET IsRead = 1 WHERE UserId IS NULL';
      const req = pool.request();
      if (userId) req.input('userId', db.sql.Int, userId);
      await req.query(query);
      return true;
    } else {
      const list = localDb.notifications || [];
      list.forEach(n => {
        if (userId && n.userId === parseInt(userId)) n.isRead = true;
        if (!userId && n.userId === null) n.isRead = true;
      });
      db.saveLocalDb();
      return true;
    }
  }
};

module.exports = notificationRepository;
