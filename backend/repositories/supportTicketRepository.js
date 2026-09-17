const db = require('../config/db');

const supportTicketRepository = {
  async create(data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, data.storeId || null)
        .input('storeName', db.sql.NVarChar, data.storeName || null)
        .input('userId', db.sql.Int, data.userId || null)
        .input('userEmail', db.sql.NVarChar, data.userEmail || null)
        .input('subject', db.sql.NVarChar, data.subject)
        .input('description', db.sql.NVarChar, data.description)
        .input('category', db.sql.NVarChar, data.category || 'general')
        .input('priority', db.sql.NVarChar, data.priority || 'medium')
        .input('status', db.sql.NVarChar, data.status || 'open')
        .input('assignedTo', db.sql.Int, data.assignedTo || null)
        .input('businessType', db.sql.NVarChar, data.businessType || null)
        .input('planKey', db.sql.NVarChar, data.planKey || null)
        .query(`INSERT INTO SupportTickets (StoreId, StoreName, UserId, UserEmail, Subject, Description, Category, Priority, Status, AssignedTo, BusinessType, PlanKey) 
                OUTPUT INSERTED.TicketId VALUES (@storeId, @storeName, @userId, @userEmail, @subject, @description, @category, @priority, @status, @assignedTo, @businessType, @planKey)`);
      return res.recordset[0].TicketId;
    }
    const entry = { ...data, ticketId: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    localDb.supportTickets.push(entry);
    db.saveLocalDb();
    return entry.ticketId;
  },

  async getAll(filters = {}) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      let query = 'SELECT * FROM SupportTickets WHERE 1=1';
      const request = pool.request();
      if (filters.status) { query += ' AND Status = @status'; request.input('status', db.sql.NVarChar, filters.status); }
      if (filters.priority) { query += ' AND Priority = @priority'; request.input('priority', db.sql.NVarChar, filters.priority); }
      if (filters.category) { query += ' AND Category = @category'; request.input('category', db.sql.NVarChar, filters.category); }
      if (filters.storeId) { query += ' AND StoreId = @storeId'; request.input('storeId', db.sql.Int, filters.storeId); }
      if (filters.userId) { query += ' AND UserId = @userId'; request.input('userId', db.sql.Int, filters.userId); }
      if (filters.businessType) { query += ' AND BusinessType = @businessType'; request.input('businessType', db.sql.NVarChar, filters.businessType); }
      if (filters.planKey) { query += ' AND PlanKey = @planKey'; request.input('planKey', db.sql.NVarChar, filters.planKey); }
      query += ' ORDER BY CreatedAt DESC';
      const res = await request.query(query);
      return res.recordset;
    }
    let tickets = [...localDb.supportTickets].reverse();
    if (filters.status) tickets = tickets.filter(t => t.status === filters.status);
    if (filters.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    if (filters.category) tickets = tickets.filter(t => t.category === filters.category);
    if (filters.storeId) tickets = tickets.filter(t => t.storeId === parseInt(filters.storeId));
    if (filters.userId) tickets = tickets.filter(t => t.userId === parseInt(filters.userId));
    if (filters.businessType) tickets = tickets.filter(t => t.businessType === filters.businessType);
    if (filters.planKey) tickets = tickets.filter(t => t.planKey === filters.planKey);
    return tickets;
  },

  async getById(id) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('id', db.sql.Int, id).query(`
        SELECT t.*, u.FirstName, u.LastName, u.Role, u.CreatedAt as UserCreatedAt,
               s.Name as StoreName2, s.IsActive as StoreIsActive, s.CreatedAt as StoreCreatedAt
        FROM SupportTickets t
        LEFT JOIN Users u ON t.UserId = u.UserId
        LEFT JOIN Stores s ON t.StoreId = s.StoreId
        WHERE t.TicketId = @id
      `);
      return res.recordset[0] || null;
    }
    const ticket = localDb.supportTickets.find(t => t.ticketId === parseInt(id));
    if (!ticket) return null;
    const user = localDb.users.find(u => u.id === ticket.userId);
    const store = localDb.stores.find(s => s.id === ticket.storeId);
    return { ...ticket, firstName: user?.firstName, lastName: user?.lastName, userCreatedAt: user?.createdAt, storeName2: store?.name, storeIsActive: store?.isActive ?? store?.IsActive, storeCreatedAt: store?.createdAt };
  },

  async update(id, data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const request = pool.request().input('id', db.sql.Int, id);
      let setClauses = [];
      if (data.status !== undefined) { setClauses.push('Status=@status'); request.input('status', db.sql.NVarChar, data.status); }
      if (data.priority !== undefined) { setClauses.push('Priority=@priority'); request.input('priority', db.sql.NVarChar, data.priority); }
      if (data.assignedTo !== undefined) { setClauses.push('AssignedTo=@assignedTo'); request.input('assignedTo', db.sql.Int, data.assignedTo); }
      if (data.category !== undefined) { setClauses.push('Category=@category'); request.input('category', db.sql.NVarChar, data.category); }
      if (data.businessType !== undefined) { setClauses.push('BusinessType=@businessType'); request.input('businessType', db.sql.NVarChar, data.businessType); }
      if (data.planKey !== undefined) { setClauses.push('PlanKey=@planKey'); request.input('planKey', db.sql.NVarChar, data.planKey); }
      if (setClauses.length > 0) {
        setClauses.push('UpdatedAt=GETDATE()');
        await request.query(`UPDATE SupportTickets SET ${setClauses.join(', ')} WHERE TicketId=@id`);
      }
      return true;
    }
    const idx = localDb.supportTickets.findIndex(t => t.ticketId === parseInt(id));
    if (idx === -1) return false;
    localDb.supportTickets[idx] = { ...localDb.supportTickets[idx], ...data, updatedAt: new Date().toISOString() };
    db.saveLocalDb();
    return true;
  },

  async addReply(ticketId, data) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request()
        .input('ticketId', db.sql.Int, ticketId)
        .input('userId', db.sql.Int, data.userId || null)
        .input('userRole', db.sql.NVarChar, data.userRole || null)
        .input('message', db.sql.NVarChar, data.message)
        .input('isInternal', db.sql.Bit, data.isInternal ? 1 : 0)
        .query(`INSERT INTO SupportTicketReplies (TicketId, UserId, UserRole, Message, IsInternal) 
                OUTPUT INSERTED.ReplyId VALUES (@ticketId, @userId, @userRole, @message, @isInternal)`);
      if (!data.isInternal) {
        await pool.request().input('id', db.sql.Int, ticketId).query("UPDATE SupportTickets SET UpdatedAt=GETDATE(), Status='in_progress' WHERE TicketId=@id AND Status='open'");
      }
      return res.recordset[0].ReplyId;
    }
    const reply = { ...data, replyId: Date.now(), ticketId: parseInt(ticketId), createdAt: new Date().toISOString(), isInternal: data.isInternal || false };
    if (!localDb.supportTicketReplies) localDb.supportTicketReplies = [];
    localDb.supportTicketReplies.push(reply);
    if (!data.isInternal) {
      const ticket = localDb.supportTickets.find(t => t.ticketId === parseInt(ticketId));
      if (ticket) { ticket.updatedAt = new Date().toISOString(); if (ticket.status === 'open') ticket.status = 'in_progress'; }
    }
    db.saveLocalDb();
    return reply.replyId;
  },

  async getReplies(ticketId) {
    const isSql = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    if (isSql) {
      const res = await pool.request().input('ticketId', db.sql.Int, ticketId).query(`
        SELECT r.*, u.FirstName, u.LastName
        FROM SupportTicketReplies r
        LEFT JOIN Users u ON r.UserId = u.UserId
        WHERE r.TicketId = @ticketId ORDER BY r.CreatedAt ASC
      `);
      return res.recordset;
    }
    const replies = (localDb.supportTicketReplies || []).filter(r => r.ticketId === parseInt(ticketId)).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return replies.map(r => {
      const user = localDb.users.find(u => u.id === r.userId);
      return { ...r, firstName: user?.firstName, lastName: user?.lastName };
    });
  }
};

module.exports = supportTicketRepository;
