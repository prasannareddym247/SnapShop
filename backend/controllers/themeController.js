const cmsRepository = require('../repositories/cmsRepository');
const db = require('../config/db');

const themeController = {
  async getStarterThemes(req, res) {
    try {
      const isSql = db.getUseSqlServer();
      if (isSql) {
        const pool = db.getPool();
        const results = await pool.request().query('SELECT ThemeKey as themeKey, Name as name, ConfigData as configData FROM Themes');
        return res.json(results.recordset.map(t => ({
          themeKey: t.themeKey,
          name: t.name,
          settings: JSON.parse(t.configData)
        })));
      } else {
        const localDb = db.getLocalDb();
        return res.json(localDb.themes.map(t => ({
          themeKey: t.themeKey,
          name: t.name,
          settings: JSON.parse(t.configData)
        })));
      }
    } catch (err) {
      console.error('Failed to get starter themes:', err);
      res.status(500).json({ error: 'Failed to fetch starter themes' });
    }
  },

  async getActiveTheme(req, res) {
    try {
      const storeId = req.storeId;
      const theme = await cmsRepository.getStoreTheme(storeId);
      res.json(theme);
    } catch (err) {
      console.error('Failed to get active theme:', err);
      res.status(500).json({ error: 'Failed to fetch active storefront theme config' });
    }
  },

  async updateThemeSettings(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { themeKey, settings, sections } = req.body;

      await cmsRepository.updateStoreTheme(storeId, tenantId, themeKey, settings, sections);
      res.json({ message: 'Store theme configurations published successfully' });
    } catch (err) {
      console.error('Failed to update store theme settings:', err);
      res.status(500).json({ error: 'Failed to publish store customizer values' });
    }
  },

  async publishTheme(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { themeKey } = req.body;

      await cmsRepository.selectTheme(storeId, tenantId, themeKey);
      res.json({ message: `Theme ${themeKey} selected and published successfully!` });
    } catch (err) {
      console.error('Failed to change active store theme:', err);
      res.status(500).json({ error: 'Failed to change published theme key' });
    }
  },

  async duplicateTheme(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { themeKey } = req.body;

      const active = await cmsRepository.getStoreTheme(storeId);
      await cmsRepository.updateStoreTheme(storeId, tenantId, `${themeKey}-copy`, active.settings, active.sections);
      res.json({ message: 'Theme settings cloned successfully!' });
    } catch (err) {
      console.error('Failed to clone theme layout settings:', err);
      res.status(500).json({ error: 'Theme clone request failed' });
    }
  },

  async resetTheme(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { themeKey } = req.body;

      let config = '{}';
      const isSql = db.getUseSqlServer();
      if (isSql) {
        const pool = db.getPool();
        const check = await pool.request().input('themeKey', sql.NVarChar, themeKey).query('SELECT ConfigData FROM Themes WHERE ThemeKey = @themeKey');
        if (check.recordset.length > 0) config = check.recordset[0].ConfigData;
      } else {
        const localDb = db.getLocalDb();
        const matched = localDb.themes.find(t => t.themeKey === themeKey);
        if (matched) config = matched.configData;
      }

      const defaultSections = [
        { id: 'sec-hero', type: 'Hero Banner', title: 'Fresh & Organic Harvest', subtitle: 'Order daily organic veggies directly to your doorstep.', buttonText: 'Shop Harvest Now', isVisible: true },
        { id: 'sec-cats', type: 'Categories', title: 'Shop by Category', isVisible: true },
        { id: 'sec-feats', type: 'Featured Products', title: 'Top Discount Organic Bestsellers', limit: 4, isVisible: true },
        { id: 'sec-faq', type: 'FAQ', title: 'Frequently Asked Questions', items: [{ q: 'Do you deliver daily?', a: 'Yes, between 9 AM to 7 PM everyday.' }], isVisible: true },
        { id: 'sec-news', type: 'Newsletter', title: 'Stay Updated', subtitle: 'Join our mailing list to receive coupons.', isVisible: true }
      ];

      await cmsRepository.updateStoreTheme(storeId, tenantId, themeKey, JSON.parse(config), defaultSections);
      res.json({ message: 'Theme layout defaults reset successfully!' });
    } catch (err) {
      console.error('Failed to reset theme layouts config:', err);
      res.status(500).json({ error: 'Reset request failed' });
    }
  }
};

module.exports = themeController;
