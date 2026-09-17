const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/banners', productController.getBanners);
router.get('/:id', productController.getProductById);

module.exports = router;
