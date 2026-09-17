const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateTenant } = require('../middlewares/tenantMiddleware');

// Public endpoint to read active storefront branding colors/sections
router.get('/active', themeController.getActiveTheme);

// Protected endpoints for Store Customizer changes
router.use(authenticateToken);
router.use(validateTenant);

router.get('/', themeController.getStarterThemes);
router.put('/customize', themeController.updateThemeSettings);
router.post('/select', themeController.publishTheme);
router.post('/duplicate', themeController.duplicateTheme);
router.post('/reset', themeController.resetTheme);

module.exports = router;
