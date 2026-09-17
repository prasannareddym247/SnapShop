const db = require('../config/db');

const addressRepository = {
  async getAddresses(userId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query('SELECT AddressId as id, AddressType as addressType, Line1 as line1, Line2 as line2, City as city, State as state, PostalCode as postalCode, Country as country FROM Addresses WHERE UserId = @userId');
      return res.recordset;
    } else {
      return localDb.addresses.filter(a => a.userId === parseInt(userId));
    }
  },

  async addAddress(userId, addr) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('type', db.sql.NVarChar, addr.addressType || 'Shipping')
        .input('line1', db.sql.NVarChar, addr.line1)
        .input('line2', db.sql.NVarChar, addr.line2 || null)
        .input('city', db.sql.NVarChar, addr.city)
        .input('state', db.sql.NVarChar, addr.state)
        .input('zip', db.sql.NVarChar, addr.postalCode)
        .input('country', db.sql.NVarChar, addr.country || 'India')
        .query(`
          INSERT INTO Addresses (UserId, AddressType, Line1, Line2, City, State, PostalCode, Country)
          OUTPUT INSERTED.AddressId as id
          VALUES (@userId, @type, @line1, @line2, @city, @state, @zip, @country)
        `);
      return { id: res.recordset[0].id, userId, ...addr };
    } else {
      const newId = localDb.addresses.length > 0 ? Math.max(...localDb.addresses.map(a => a.id)) + 1 : 1;
      const newAddr = {
        id: newId,
        userId: parseInt(userId),
        addressType: addr.addressType || 'Shipping',
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || 'India'
      };
      localDb.addresses.push(newAddr);
      db.saveLocalDb();
      return newAddr;
    }
  },

  async deleteAddress(userId, addressId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('addressId', db.sql.Int, addressId)
        .query('DELETE FROM Addresses WHERE UserId = @userId AND AddressId = @addressId');
      return true;
    } else {
      localDb.addresses = localDb.addresses.filter(a => !(a.userId === parseInt(userId) && a.id === parseInt(addressId)));
      db.saveLocalDb();
      return true;
    }
  }
};

module.exports = addressRepository;
