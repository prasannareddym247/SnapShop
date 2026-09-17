const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const auditService = require('../services/auditService');
const adminNotificationService = require('../services/adminNotificationService');
const subscriptionService = require('../services/subscriptionService');
const usageService = require('../services/usageService');

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

const adminStoreController = {
  async getAllStores(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      const stores = users.filter(u => u.role === 'Seller').map(u => ({
        storeId: u.storeId || u.id,
        storeName: u.storeName || u.firstName + "'s Store",
        ownerName: `${u.firstName} ${u.lastName || ''}`.trim(),
        email: u.email,
        phone: u.phone,
        status: u.sellerStatus || 'Pending',
        gstin: u.gstin,
        createdAt: u.createdAt,
        productCount: 0
      }));
      const products = await productRepository.getAllProducts();
      stores.forEach(s => {
        s.productCount = products.filter(p => p.vendorId === parseInt(s.storeId)).length;
      });
      res.json(stores);
    } catch (err) {
      console.error('Error fetching stores:', err);
      res.status(500).json({ error: 'Server error fetching stores.' });
    }
  },

  async getStoreDetail(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      const store = users.find(u => u.role === 'Seller' && u.id === parseInt(req.params.id));
      if (!store) return res.status(404).json({ error: 'Store not found.' });
      const products = await productRepository.getAllProducts();
      const storeProducts = products.filter(p => p.vendorId === store.id);
      let subscription = null;
      try { subscription = await subscriptionService.getStoreSubscription(store.id); } catch {}
      let usage = null;
      try { usage = await usageService.getStoreUsageSummary(store.id); } catch {}
      res.json({
        storeId: store.id,
        storeName: store.storeName || `${store.firstName}'s Store`,
        ownerName: `${store.firstName} ${store.lastName || ''}`.trim(),
        email: store.email,
        phone: store.phone,
        role: store.role,
        status: store.sellerStatus || 'Pending',
        gstin: store.gstin,
        createdAt: store.createdAt,
        productCount: storeProducts.length,
        products: storeProducts,
        subscription,
        usage
      });
    } catch (err) {
      console.error('Error fetching store detail:', err);
      res.status(500).json({ error: 'Server error fetching store detail.' });
    }
  },

  async updateStoreStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required.' });
      await userRepository.updateVendorStatus(req.params.id, status);
      await auditService.log('UPDATE_STORE_STATUS', req.user.id, req.user.email, { storeId: req.params.id, newStatus: status }, 'Store', req.params.id, getClientIp(req));
      await adminNotificationService.create('store_status', `Store ${status}`, `Store #${req.params.id} status changed to ${status}`, status === 'Suspended' ? 'high' : 'normal', 'Store', req.params.id);
      res.json({ message: `Store status updated to ${status}.` });
    } catch (err) {
      console.error('Error updating store status:', err);
      res.status(500).json({ error: 'Server error updating store status.' });
    }
  },

  async deleteStore(req, res) {
    try {
      await userRepository.deleteUser(req.params.id);
      await auditService.log('DELETE_STORE', req.user.id, req.user.email, { storeId: req.params.id }, 'Store', req.params.id, getClientIp(req));
      res.json({ message: 'Store deleted.' });
    } catch (err) {
      console.error('Error deleting store:', err);
      res.status(500).json({ error: 'Server error deleting store.' });
    }
  }
};

module.exports = adminStoreController;
