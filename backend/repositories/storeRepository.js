const db = require('../config/db');

const storeRepository = {
  async createTenant(name) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('name', db.sql.NVarChar, name)
        .query('INSERT INTO Tenants (Name) OUTPUT INSERTED.TenantId VALUES (@name)');
      return res.recordset[0].TenantId;
    } else {
      const newId = localDb.tenants.length > 0 ? Math.max(...localDb.tenants.map(t => t.id)) + 1 : 1;
      localDb.tenants.push({
        id: newId,
        name,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return newId;
    }
  },

  async createStore(tenantId, ownerId, name, slug) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      // Ensure unique slug
      let finalSlug = slug;
      const slugCheck = await pool.request()
        .input('slug', db.sql.NVarChar, slug)
        .query('SELECT COUNT(*) as cnt FROM Stores WHERE Slug = @slug');
      if (slugCheck.recordset[0].cnt > 0) {
        finalSlug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }

      const res = await pool.request()
        .input('tenantId', db.sql.Int, tenantId)
        .input('ownerId', db.sql.Int, ownerId)
        .input('name', db.sql.NVarChar, name)
        .input('slug', db.sql.NVarChar, finalSlug)
        .query(`
          INSERT INTO Stores (TenantId, OwnerId, Name, Slug, IsActive)
          OUTPUT INSERTED.StoreId
          VALUES (@tenantId, @ownerId, @name, @slug, 1)
        `);
      const storeId = res.recordset[0].StoreId;
      
      // Update owner user record with TenantId and StoreId
      await pool.request()
        .input('userId', db.sql.Int, ownerId)
        .input('tenantId', db.sql.Int, tenantId)
        .input('storeId', db.sql.Int, storeId)
        .query('UPDATE Users SET TenantId = @tenantId, StoreId = @storeId WHERE UserId = @userId');

      return storeId;
    } else {
      let finalSlug = slug;
      const slugCheck = localDb.stores.find(s => s.slug === slug);
      if (slugCheck) {
        finalSlug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }

      const newId = localDb.stores.length > 0 ? Math.max(...localDb.stores.map(s => s.id)) + 1 : 1;
      localDb.stores.push({
        id: newId,
        tenantId,
        ownerId,
        name,
        slug: finalSlug,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Update owner user record
      const uIdx = localDb.users.findIndex(u => u.id === parseInt(ownerId));
      if (uIdx !== -1) {
        localDb.users[uIdx].tenantId = tenantId;
        localDb.users[uIdx].storeId = newId;
      }

      db.saveLocalDb();
      return newId;
    }
  },

  async getStoreById(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('id', db.sql.Int, storeId)
        .query('SELECT StoreId as id, TenantId as tenantId, OwnerId as ownerId, Name as name, Slug as slug, IsActive as isActive, CreatedAt as createdAt FROM Stores WHERE StoreId = @id');
      return res.recordset.length > 0 ? res.recordset[0] : null;
    } else {
      const s = localDb.stores.find(st => st.id === parseInt(storeId));
      return s ? { ...s } : null;
    }
  },

  async getStoreBySlug(slug) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('slug', db.sql.NVarChar, slug)
        .query('SELECT StoreId as id, TenantId as tenantId, OwnerId as ownerId, Name as name, Slug as slug, IsActive as isActive, CreatedAt as createdAt FROM Stores WHERE Slug = @slug');
      return res.recordset.length > 0 ? res.recordset[0] : null;
    } else {
      const s = localDb.stores.find(st => st.slug.toLowerCase() === slug.toLowerCase());
      return s ? { ...s } : null;
    }
  },

  async getStoreByOwnerId(ownerId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('ownerId', db.sql.Int, ownerId)
        .query('SELECT StoreId as id, TenantId as tenantId, OwnerId as ownerId, Name as name, Slug as slug, IsActive as isActive, CreatedAt as createdAt FROM Stores WHERE OwnerId = @ownerId');
      return res.recordset.length > 0 ? res.recordset[0] : null;
    } else {
      const s = localDb.stores.find(st => st.ownerId === parseInt(ownerId));
      return s ? { ...s } : null;
    }
  },

  async getStoreSettings(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT SettingKey as [key], SettingValue as [value] FROM StoreSettings WHERE StoreId = @storeId');
      const settings = {};
      res.recordset.forEach(row => {
        settings[row.key] = row.value;
      });
      return settings;
    } else {
      const settings = {};
      localDb.storeSettings
        .filter(s => s.storeId === parseInt(storeId))
        .forEach(s => {
          settings[s.key] = s.value;
        });
      return settings;
    }
  },

  async updateStoreSettings(storeId, tenantId, settingsMap) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      for (const [key, value] of Object.entries(settingsMap)) {
        // Upsert setting key
        const checkRes = await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('key', db.sql.NVarChar, key)
          .query('SELECT SettingId FROM StoreSettings WHERE StoreId = @storeId AND SettingKey = @key');
        
        if (checkRes.recordset.length > 0) {
          await pool.request()
            .input('storeId', db.sql.Int, storeId)
            .input('key', db.sql.NVarChar, key)
            .input('val', db.sql.NVarChar, value)
            .query('UPDATE StoreSettings SET SettingValue = @val WHERE StoreId = @storeId AND SettingKey = @key');
        } else {
          await pool.request()
            .input('storeId', db.sql.Int, storeId)
            .input('tenantId', db.sql.Int, tenantId)
            .input('key', db.sql.NVarChar, key)
            .input('val', db.sql.NVarChar, value)
            .query('INSERT INTO StoreSettings (StoreId, TenantId, SettingKey, SettingValue) VALUES (@storeId, @tenantId, @key, @val)');
        }
      }
      return this.getStoreSettings(storeId);
    } else {
      for (const [key, value] of Object.entries(settingsMap)) {
        const sIdx = localDb.storeSettings.findIndex(s => s.storeId === parseInt(storeId) && s.key === key);
        if (sIdx !== -1) {
          localDb.storeSettings[sIdx].value = value;
        } else {
          localDb.storeSettings.push({
            id: localDb.storeSettings.length + 1,
            storeId: parseInt(storeId),
            tenantId: parseInt(tenantId),
            key,
            value,
            createdAt: new Date().toISOString()
          });
        }
      }
      db.saveLocalDb();
      return this.getStoreSettings(storeId);
    }
  },

  async createDefaultSettings(storeId, tenantId) {
    const defaultSettings = {
      storeName: 'My Multi-tenant Shop',
      themeColor: '#10b981',
      supportEmail: 'support@snapshop.com',
      contactPhone: '9876543210',
      currency: 'INR',
      allowCartReviews: 'true'
    };
    return this.updateStoreSettings(storeId, tenantId, defaultSettings);
  },

  async createDefaultCategories(tenantId) {
    // New sellers must manage/add their own categories; no default categories are seeded.
    console.log(`[Seeding] Skipping default categories seeding for tenant ${tenantId} as requested.`);
    return;
  },

  async getAllStores() {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request().query(`
        SELECT s.StoreId as id, s.TenantId as tenantId, s.OwnerId as ownerId, s.Name as name, s.Slug as slug, s.IsActive as isActive, s.CreatedAt as createdAt,
               u.Email as ownerEmail
        FROM Stores s
        LEFT JOIN Users u ON s.OwnerId = u.UserId
      `);
      return res.recordset;
    } else {
      return localDb.stores.map(s => {
        const u = localDb.users.find(user => user.id === s.ownerId);
        return {
          ...s,
          ownerEmail: u ? u.email : 'unknown@snapshop.com'
        };
      });
    }
  },

  async updateStoreStatus(storeId, isActive) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const bitVal = isActive ? 1 : 0;

    if (useSqlServer) {
      await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('active', db.sql.Bit, bitVal)
        .query('UPDATE Stores SET IsActive = @active WHERE StoreId = @storeId');
      return true;
    } else {
      const s = localDb.stores.find(st => st.id === parseInt(storeId));
      if (!s) return false;
      s.isActive = !!isActive;
      db.saveLocalDb();
      return true;
    }
  }
};

module.exports = storeRepository;
