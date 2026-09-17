const categoryRepository = require('../repositories/categoryRepository');

const categoryController = {
  async getCategories(req, res) {
    try {
      const tenantId = req.tenantId || 1;
      const categories = await categoryRepository.getCategories(tenantId);
      res.json(categories);
    } catch (err) {
      console.error('[Category API] Fetch error:', err);
      res.status(500).json({ error: 'Server error retrieving categories.' });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, slug, description, parentCategoryId, isActive } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Category name and slug are required.' });
      }

      const tenantId = req.tenantId || 1;
      const category = await categoryRepository.createCategory({
        name,
        slug,
        description,
        parentCategoryId,
        isActive,
        tenantId
      });

      console.log(`[Category API] Created category "${name}" for Tenant #${tenantId}`);
      res.status(201).json(category);
    } catch (err) {
      console.error('[Category API] Create error:', err);
      res.status(500).json({ error: 'Server error creating category.' });
    }
  },

  async updateCategory(req, res) {
    try {
      const { name, slug, description, parentCategoryId, isActive } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Category name and slug are required.' });
      }

      const category = await categoryRepository.updateCategory(req.params.id, {
        name,
        slug,
        description,
        parentCategoryId,
        isActive
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found.' });
      }

      console.log(`[Category API] Updated category #${req.params.id}`);
      res.json(category);
    } catch (err) {
      console.error('[Category API] Update error:', err);
      res.status(500).json({ error: 'Server error updating category.' });
    }
  },

  async deleteCategory(req, res) {
    try {
      await categoryRepository.deleteCategory(req.params.id);
      console.log(`[Category API] Deleted category #${req.params.id}`);
      res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
      console.error('[Category API] Delete error:', err);
      res.status(500).json({ error: 'Server error deleting category.' });
    }
  }
};

module.exports = categoryController;
