const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, checkAdmin } = require('../middlewares/authMiddleware');

// Guest & Resolver endpoints
router.get('/context', storeController.getTenantContext);
router.get('/info/:slug', storeController.getStoreBySlug);
router.get('/info/:slug/payments', storeController.getStorePaymentsPublic);

// Store Owner settings endpoints
router.post('/', authenticateToken, storeController.createStore);
router.get('/me', authenticateToken, storeController.getMyStore);
router.put('/settings', authenticateToken, storeController.updateSettings);

// Super Admin endpoints
router.get('/admin/list', authenticateToken, checkAdmin, storeController.superAdminGetAllStores);
router.post('/admin/status', authenticateToken, checkAdmin, storeController.superAdminUpdateStoreStatus);

module.exports = router;
