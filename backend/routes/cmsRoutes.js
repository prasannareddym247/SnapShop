const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateTenant } = require('../middlewares/tenantMiddleware');

// Public storefront lookups (no auth required)
router.get('/pages', cmsController.getPages);
router.get('/menus', cmsController.getMenus);
router.get('/blog', cmsController.getBlogPosts);

// Protected Admin/Merchant operations
router.use(authenticateToken);
router.use(validateTenant);

router.post('/pages', cmsController.createPage);
router.put('/pages/:id', cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

router.post('/menus', cmsController.updateMenu);

router.get('/media', cmsController.getMedia);
router.post('/media', cmsController.addMedia);
router.delete('/media/:id', cmsController.deleteMedia);

router.post('/blog', cmsController.createBlogPost);
router.put('/blog/:id', cmsController.updateBlogPost);
router.delete('/blog/:id', cmsController.deleteBlogPost);

module.exports = router;
