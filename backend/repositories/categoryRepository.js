const db = require('../config/db');

const categoryRepository = {
  async getCategories(tenantId = 1) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('tenantId', db.sql.Int, tenantId)
        .query('SELECT CategoryId as id, Name as name, Slug as slug, Description as description, ParentCategoryId as parentCategoryId, IsActive as isActive, TenantId as tenantId FROM Categories WHERE TenantId = @tenantId');
      return res.recordset;
    } else {
      const list = localDb.categories.filter(c => (c.tenantId || 1) === parseInt(tenantId));
      return list.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        parentCategoryId: c.parentCategoryId || null,
        isActive: c.isActive !== undefined ? c.isActive : true,
        tenantId: c.tenantId || 1
      }));
    }
  },

  async createCategory(catData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const tenantId = catData.tenantId || 1;
    const isActive = catData.isActive !== undefined ? (catData.isActive ? 1 : 0) : 1;
    const parentId = catData.parentCategoryId ? parseInt(catData.parentCategoryId) : null;

    if (useSqlServer) {
      const res = await pool.request()
        .input('name', db.sql.NVarChar, catData.name)
        .input('slug', db.sql.NVarChar, catData.slug)
        .input('desc', db.sql.NVarChar, catData.description || null)
        .input('parent', db.sql.Int, parentId)
        .input('active', db.sql.Bit, isActive)
        .input('tenantId', db.sql.Int, tenantId)
        .query(`
          INSERT INTO Categories (Name, Slug, Description, ParentCategoryId, IsActive, TenantId)
          OUTPUT INSERTED.CategoryId as id
          VALUES (@name, @slug, @desc, @parent, @active, @tenantId)
        `);
      return { id: res.recordset[0].id, ...catData, isActive: !!isActive, parentCategoryId: parentId };
    } else {
      const newId = localDb.categories.length > 0 ? Math.max(...localDb.categories.map(c => c.id)) + 1 : 1;
      const newCat = {
        id: newId,
        name: catData.name,
        slug: catData.slug,
        description: catData.description || '',
        parentCategoryId: parentId,
        isActive: !!isActive,
        tenantId: parseInt(tenantId),
        createdAt: new Date().toISOString()
      };
      localDb.categories.push(newCat);
      db.saveLocalDb();
      return newCat;
    }
  },

  async updateCategory(catId, catData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const isActive = catData.isActive !== undefined ? (catData.isActive ? 1 : 0) : 1;
    const parentId = catData.parentCategoryId ? parseInt(catData.parentCategoryId) : null;

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, catId)
        .input('name', db.sql.NVarChar, catData.name)
        .input('slug', db.sql.NVarChar, catData.slug)
        .input('desc', db.sql.NVarChar, catData.description || null)
        .input('parent', db.sql.Int, parentId)
        .input('active', db.sql.Bit, isActive)
        .query(`
          UPDATE Categories
          SET Name = @name, Slug = @slug, Description = @desc, ParentCategoryId = @parent, IsActive = @active
          WHERE CategoryId = @id
        `);
      return { id: parseInt(catId), ...catData, isActive: !!isActive, parentCategoryId: parentId };
    } else {
      const idx = localDb.categories.findIndex(c => c.id === parseInt(catId));
      if (idx !== -1) {
        localDb.categories[idx] = {
          ...localDb.categories[idx],
          name: catData.name,
          slug: catData.slug,
          description: catData.description || '',
          parentCategoryId: parentId,
          isActive: !!isActive
        };
        db.saveLocalDb();
        return localDb.categories[idx];
      }
      return null;
    }
  },

  async deleteCategory(catId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, catId)
        .query('DELETE FROM Categories WHERE CategoryId = @id');
      return true;
    } else {
      localDb.categories = localDb.categories.filter(c => c.id !== parseInt(catId));
      db.saveLocalDb();
      return true;
    }
  }
};

module.exports = categoryRepository;
