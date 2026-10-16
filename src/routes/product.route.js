const express = require('express');
const {
  listProducts,
  getProductBySlug,
  myProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, requirePermission } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const router = express.Router();

// Public
router.get('/', listProducts);

// Panel (login + permission zaroori). '/mine/all' ko '/:slug' se pehle rakhna zaroori hai
router.get('/mine/all', protect, requirePermission('product:create'), myProducts);
router.post('/', protect, requirePermission('product:create'), upload.array('images', 8), createProduct);
router.put('/:id', protect, requirePermission('product:create'), upload.array('images', 8), updateProduct);
router.delete('/:id', protect, requirePermission('product:create'), deleteProduct);

// Public
router.get('/:slug', getProductBySlug);

module.exports = router;