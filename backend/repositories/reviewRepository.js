const db = require('../config/db');

const reviewRepository = {
  async getReviewsForProduct(productId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('productId', db.sql.Int, productId)
        .query(`
          SELECT r.ReviewId as id, r.Rating as rating, r.Comment as comment, r.CreatedAt as createdAt,
                 u.FirstName + ' ' + u.LastName as reviewerName
          FROM Reviews r
          JOIN Users u ON r.UserId = u.UserId
          WHERE r.ProductId = @productId
          ORDER BY r.CreatedAt DESC
        `);
      return res.recordset;
    } else {
      const prodReviews = localDb.reviews.filter(r => r.productId === parseInt(productId));
      return prodReviews.map(r => {
        const u = localDb.users.find(user => user.id === r.userId);
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewerName: u ? `${u.firstName} ${u.lastName}` : 'Anonymous'
        };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async addReview(userId, productId, rating, comment) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('productId', db.sql.Int, productId)
        .input('rating', db.sql.Int, rating)
        .input('comment', db.sql.NVarChar, comment || null)
        .query(`
          INSERT INTO Reviews (UserId, ProductId, Rating, Comment)
          OUTPUT INSERTED.ReviewId as id
          VALUES (@userId, @productId, @rating, @comment)
        `);
      return res.recordset[0].id;
    } else {
      const newId = localDb.reviews.length > 0 ? Math.max(...localDb.reviews.map(r => r.id)) + 1 : 1;
      const newReview = {
        id: newId,
        userId: parseInt(userId),
        productId: parseInt(productId),
        rating: parseInt(rating),
        comment: comment || '',
        createdAt: new Date().toISOString()
      };
      localDb.reviews.push(newReview);
      db.saveLocalDb();
      return newId;
    }
  },

  async getAverageRating(productId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('productId', db.sql.Int, productId)
        .query('SELECT AVG(CAST(Rating AS DECIMAL(10,2))) as avgRating, COUNT(*) as reviewCount FROM Reviews WHERE ProductId = @productId');
      
      const record = res.recordset[0];
      return {
        avgRating: record.avgRating ? parseFloat(record.avgRating).toFixed(1) : '0.0',
        reviewCount: record.reviewCount || 0
      };
    } else {
      const prodReviews = localDb.reviews.filter(r => r.productId === parseInt(productId));
      if (prodReviews.length === 0) return { avgRating: '0.0', reviewCount: 0 };
      const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        avgRating: (sum / prodReviews.length).toFixed(1),
        reviewCount: prodReviews.length
      };
    }
  },

  async getReviewsForVendor(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query(`
          SELECT r.ReviewId as id, r.Rating as rating, r.Comment as comment, r.CreatedAt as createdAt,
                 p.Name as productName, u.FirstName + ' ' + u.LastName as reviewerName
          FROM Reviews r
          JOIN Products p ON r.ProductId = p.ProductId
          JOIN Users u ON r.UserId = u.UserId
          WHERE p.VendorId = @vendorId
          ORDER BY r.CreatedAt DESC
        `);
      return res.recordset;
    } else {
      const vendorProducts = localDb.products.filter(p => p.vendorId === parseInt(vendorId)).map(p => p.id);
      const sellerReviews = localDb.reviews.filter(r => vendorProducts.includes(r.productId));
      return sellerReviews.map(r => {
        const p = localDb.products.find(prod => prod.id === r.productId);
        const u = localDb.users.find(user => user.id === r.userId);
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          productName: p ? p.name : 'Unknown Product',
          reviewerName: u ? `${u.firstName} ${u.lastName}` : 'Anonymous'
        };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};

module.exports = reviewRepository;
