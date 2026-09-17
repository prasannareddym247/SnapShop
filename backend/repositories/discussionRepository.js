const db = require('../config/db');

const discussionRepository = {
  async getDiscussions(productId = null, sellerId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      let query = 'SELECT MessageId as id, ProductId as productId, SellerId as sellerId, SenderId as senderId, SenderRole as senderRole, Message as message, AttachmentUrl as attachmentUrl, CreatedAt as createdAt FROM Discussions WHERE 1=1';
      const req = pool.request();
      if (productId) {
        query += ' AND ProductId = @productId';
        req.input('productId', db.sql.Int, productId);
      }
      if (sellerId) {
        query += ' AND SellerId = @sellerId';
        req.input('sellerId', db.sql.Int, sellerId);
      }
      query += ' ORDER BY CreatedAt ASC';
      const res = await req.query(query);
      return res.recordset;
    } else {
      let list = localDb.discussions || [];
      if (productId) {
        list = list.filter(d => d.productId === parseInt(productId));
      }
      if (sellerId) {
        list = list.filter(d => d.sellerId === parseInt(sellerId));
      }
      return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  },

  async createMessage(data) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const productId = data.productId ? parseInt(data.productId) : null;
    const sellerId = data.sellerId ? parseInt(data.sellerId) : null;
    const senderId = parseInt(data.senderId);
    const senderRole = data.senderRole;
    const message = data.message;
    const attachmentUrl = data.attachmentUrl || null;

    if (useSqlServer) {
      const res = await pool.request()
        .input('productId', db.sql.Int, productId)
        .input('sellerId', db.sql.Int, sellerId)
        .input('senderId', db.sql.Int, senderId)
        .input('senderRole', db.sql.NVarChar, senderRole)
        .input('message', db.sql.NVarChar, message)
        .input('attachmentUrl', db.sql.NVarChar, attachmentUrl)
        .query(`
          INSERT INTO Discussions (ProductId, SellerId, SenderId, SenderRole, Message, AttachmentUrl)
          OUTPUT INSERTED.MessageId as id
          VALUES (@productId, @sellerId, @senderId, @senderRole, @message, @attachmentUrl)
        `);
      return res.recordset[0].id;
    } else {
      if (!localDb.discussions) localDb.discussions = [];
      const newId = localDb.discussions.length > 0 ? Math.max(...localDb.discussions.map(d => d.id)) + 1 : 1;
      const newMessage = {
        id: newId,
        productId,
        sellerId,
        senderId,
        senderRole,
        message,
        attachmentUrl,
        createdAt: new Date().toISOString()
      };
      localDb.discussions.push(newMessage);
      db.saveLocalDb();
      return newId;
    }
  }
};

module.exports = discussionRepository;
