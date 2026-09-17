const db = require('../config/db');

const couponRepository = {
  async getCoupons(vendorId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      let query = 'SELECT CouponId as id, Code as code, DiscountType as discountType, DiscountValue as discountValue, ExpiryDate as expiryDate, VendorId as vendorId, IsActive as isActive FROM Coupons';
      let request = pool.request();
      
      if (vendorId !== null) {
        query += ' WHERE VendorId = @vendorId OR VendorId IS NULL';
        request.input('vendorId', db.sql.Int, vendorId);
      }
      
      const res = await request.query(query);
      return res.recordset;
    } else {
      if (vendorId !== null) {
        return localDb.coupons.filter(c => c.vendorId === parseInt(vendorId) || c.vendorId === null);
      }
      return localDb.coupons;
    }
  },

  async createCoupon(couponData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('code', db.sql.NVarChar, couponData.code.toUpperCase())
        .input('type', db.sql.NVarChar, couponData.discountType)
        .input('val', db.sql.Decimal(10, 2), couponData.discountValue)
        .input('expiry', db.sql.VarChar, couponData.expiryDate || null)
        .input('vendorId', db.sql.Int, couponData.vendorId || null)
        .query(`
          INSERT INTO Coupons (Code, DiscountType, DiscountValue, ExpiryDate, VendorId, IsActive)
          OUTPUT INSERTED.CouponId as id
          VALUES (@code, @type, @val, @expiry, @vendorId, 1)
        `);
      return { id: res.recordset[0].id, ...couponData, code: couponData.code.toUpperCase(), isActive: true };
    } else {
      const newId = localDb.coupons.length > 0 ? Math.max(...localDb.coupons.map(c => c.id)) + 1 : 1;
      const newCoupon = {
        id: newId,
        code: couponData.code.toUpperCase(),
        discountType: couponData.discountType,
        discountValue: parseFloat(couponData.discountValue),
        expiryDate: couponData.expiryDate || null,
        vendorId: couponData.vendorId ? parseInt(couponData.vendorId) : null,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      localDb.coupons.push(newCoupon);
      db.saveLocalDb();
      return newCoupon;
    }
  },

  async deleteCoupon(couponId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, couponId)
        .query('DELETE FROM Coupons WHERE CouponId = @id');
      return true;
    } else {
      localDb.coupons = localDb.coupons.filter(c => c.id !== parseInt(couponId));
      db.saveLocalDb();
      return true;
    }
  },

};

module.exports = couponRepository;
