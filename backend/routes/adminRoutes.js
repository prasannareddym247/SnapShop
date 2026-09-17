const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, checkAdmin } = require('../middlewares/authMiddleware');

// Lock down all routes in this file
router.use(authenticateToken);
router.use(checkAdmin);

// Products CRUD
router.post('/products', adminController.createProduct);
router.put('/products/bulk-approve', adminController.bulkApproveProducts);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// User & Vendor management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/vendors', adminController.getVendors);
router.put('/vendors/:id/approve', adminController.approveVendor);
router.put('/vendors/:id/reject', adminController.rejectVendor);
router.put('/vendors/:id/suspend', adminController.suspendVendor);
router.put('/vendors/:id/reactivate', adminController.reactivateVendor);
router.delete('/vendors/:id', adminController.deleteVendor);
router.get('/approved-sellers', adminController.getApprovedSellers);

// Pending Products Approvals
router.get('/pending-products', adminController.getPendingProducts);
router.put('/products/:id/approve', adminController.approveProduct);
router.put('/products/:id/reject', adminController.rejectProduct);
router.put('/products/:id/request-changes', adminController.requestProductChanges);

// Bulk Upload Support
router.post('/bulk-upload', adminController.bulkUpload);



// Platform Analytics
router.get('/analytics', adminController.getPlatformAnalytics);

// CMS & Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.addBanner);
router.delete('/banners/:id', adminController.deleteBanner);
router.get('/cms', adminController.getCmsPages);
router.post('/cms/:slug', adminController.saveCmsPage);

module.exports = router;
