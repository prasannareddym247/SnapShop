const storeRepository = require('../repositories/storeRepository');
const cmsRepository = require('../repositories/cmsRepository');

const storeController = {
  async createStore(req, res) {
    try {
      const { name, slug, ownerId } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Store name and slug are required.' });
      }

      // Generate Tenant
      const tenantId = await storeRepository.createTenant(`${name} Tenant`);
      
      // Generate Store
      const storeId = await storeRepository.createStore(tenantId, ownerId || req.user.userId, name, slug);

      // Create default settings & categories
      await storeRepository.createDefaultSettings(storeId, tenantId);
      await storeRepository.createDefaultCategories(tenantId);

      console.log(`[SaaS] Store manually created: "${name}" (slug: ${slug}) under Tenant #${tenantId}`);
      res.status(201).json({
        message: 'Store created successfully.',
        tenantId,
        storeId,
        slug
      });
    } catch (err) {
      console.error('[SaaS] Create Store error:', err);
      res.status(500).json({ error: err.message || 'Server error creating store.' });
    }
  },

  async getMyStore(req, res) {
    try {
      const storeId = req.storeId;
      if (!storeId) {
        return res.status(400).json({ error: 'Store context not resolved.' });
      }

      const store = await storeRepository.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ error: 'Store not found.' });
      }

      const settings = await storeRepository.getStoreSettings(storeId);
      res.json({
        store,
        settings
      });
    } catch (err) {
      console.error('[SaaS] getMyStore error:', err);
      res.status(500).json({ error: 'Server error retrieving store details.' });
    }
  },

  async updateSettings(req, res) {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings object provided.' });
      }

      const storeId = req.storeId;
      const tenantId = req.tenantId;

      const updated = await storeRepository.updateStoreSettings(storeId, tenantId, settings);
      console.log(`[SaaS] Store settings updated for Store #${storeId}`);
      res.json({
        message: 'Store settings updated successfully.',
        settings: updated
      });
    } catch (err) {
      console.error('[SaaS] Update Settings error:', err);
      res.status(500).json({ error: 'Server error updating settings.' });
    }
  },

  async getStoreBySlug(req, res) {
    try {
      const { slug } = req.params;
      const store = await storeRepository.getStoreBySlug(slug);
      if (!store) {
        return res.status(404).json({ error: `Store with slug "${slug}" not found.` });
      }
      const settings = await storeRepository.getStoreSettings(store.id);
      const theme = await cmsRepository.getStoreTheme(store.id);
      res.json({ store, settings, theme });
    } catch (err) {
      console.error('[SaaS] getStoreBySlug error:', err);
      res.status(500).json({ error: 'Server error searching store slug.' });
    }
  },

  async getTenantContext(req, res) {
    res.json({
      tenantId: req.tenantId,
      storeId: req.storeId
    });
  },

  async superAdminGetAllStores(req, res) {
    try {
      const stores = await storeRepository.getAllStores();
      res.json(stores);
    } catch (err) {
      console.error('[SaaS] Admin get stores error:', err);
      res.status(500).json({ error: 'Server error retrieving store list.' });
    }
  },

  async getStorePaymentsPublic(req, res) {
    try {
      const { slug } = req.params;
      const store = await storeRepository.getStoreBySlug(slug);
      if (!store) {
        return res.status(404).json({ error: `Store "${slug}" not found.` });
      }
      
      const integrationRepository = require('../repositories/integrationRepository');
      const data = await integrationRepository.getPaymentSettings(store.id);
      
      const publicCredentials = data.credentials.map(c => ({
        GatewayName: c.GatewayName,
        ApiKey: c.ApiKey,
        IsTestMode: c.IsTestMode
      }));
      
      res.json({
        methods: data.methods,
        credentials: publicCredentials
      });
    } catch (err) {
      console.error('[SaaS] getStorePaymentsPublic error:', err);
      res.status(500).json({ error: 'Server error retrieving payments context.' });
    }
  },

  async superAdminUpdateStoreStatus(req, res) {
    try {
      const { storeId, isActive } = req.body;
      if (!storeId) {
        return res.status(400).json({ error: 'StoreId is required.' });
      }

      await storeRepository.updateStoreStatus(storeId, isActive);
      console.log(`[SaaS] Super Admin updated status for Store #${storeId} -> Active: ${isActive}`);
      res.json({ message: 'Store status updated successfully.' });
    } catch (err) {
      console.error('[SaaS] Admin update store status error:', err);
      res.status(500).json({ error: 'Server error updating store status.' });
    }
  }
};

module.exports = storeController;
