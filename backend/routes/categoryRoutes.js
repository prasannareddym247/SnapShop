const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, checkSeller } = require('../middlewares/authMiddleware');

// Anyone can view categories (needed for storefront & dashboards)
router.get('/', categoryController.getCategories);

// Only authenticated store owners (Sellers) can manage categories
router.post('/', authenticateToken, checkSeller, categoryController.createCategory);
router.put('/:id', authenticateToken, checkSeller, categoryController.updateCategory);
router.delete('/:id', authenticateToken, checkSeller, categoryController.deleteCategory);

module.exports = router;
