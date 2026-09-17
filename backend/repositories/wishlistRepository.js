const db = require('../config/db');

const wishlistRepository = {
  async getWishlist(userId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query(`
          SELECT w.WishlistId as id, w.ProductId as productId, p.Name as productName, p.ImageUrl as imageUrl, 
                 p.Description as description, pv.Price as price
          FROM Wishlists w
          JOIN Products p ON w.ProductId = p.ProductId
          OUTER APPLY (
              SELECT TOP 1 Price FROM ProductVariants WHERE ProductId = p.ProductId ORDER BY Price ASC
          ) pv
          WHERE w.UserId = @userId
        `);
      return res.recordset;
    } else {
      const userWishlist = localDb.wishlists.filter(w => w.userId === parseInt(userId));
      return userWishlist.map(w => {
        const p = localDb.products.find(prod => prod.id === w.productId);
        const variants = localDb.productVariants.filter(v => v.productId === w.productId);
        const price = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;
        return {
          id: w.id,
          productId: w.productId,
          productName: p ? p.name : 'Unknown Product',
          imageUrl: p ? p.imageUrl : null,
          description: p ? p.description : '',
          price
        };
      });
    }
  },

  async addToWishlist(userId, productId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      // Check if already exists
      const check = await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('productId', db.sql.Int, productId)
        .query('SELECT WishlistId FROM Wishlists WHERE UserId = @userId AND ProductId = @productId');
      
      if (check.recordset.length > 0) return check.recordset[0].WishlistId;

      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('productId', db.sql.Int, productId)
        .query(`
          INSERT INTO Wishlists (UserId, ProductId)
          OUTPUT INSERTED.WishlistId as id
          VALUES (@userId, @productId)
        `);
      return res.recordset[0].id;
    } else {
      const existing = localDb.wishlists.find(w => w.userId === parseInt(userId) && w.productId === parseInt(productId));
      if (existing) return existing.id;

      const newId = localDb.wishlists.length > 0 ? Math.max(...localDb.wishlists.map(w => w.id)) + 1 : 1;
      const newItem = {
        id: newId,
        userId: parseInt(userId),
        productId: parseInt(productId),
        createdAt: new Date().toISOString()
      };
      localDb.wishlists.push(newItem);
      db.saveLocalDb();
      return newId;
    }
  },

  async removeFromWishlist(userId, productId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('productId', db.sql.Int, productId)
        .query('DELETE FROM Wishlists WHERE UserId = @userId AND ProductId = @productId');
      return true;
    } else {
      localDb.wishlists = localDb.wishlists.filter(w => !(w.userId === parseInt(userId) && w.productId === parseInt(productId)));
      db.saveLocalDb();
      return true;
    }
  }
};

module.exports = wishlistRepository;
