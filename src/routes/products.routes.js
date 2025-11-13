// src/routes/products.routes.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../validators/validate');
const productSchema = require('../validators/product.validator');

// Public routes - anyone can view products
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProduct);

// Routes protégées : seulement les admins peuvent créer, modifier, supprimer
router.post(
  '/',
  auth,
  authorize('admin'),
  validate(productSchema),
  productsController.createProduct
);

router.put(
  '/:id',
  auth,
  authorize('admin'),
  productsController.updateProduct
);

router.delete(
  '/:id',
  auth,
  authorize('admin'),
  productsController.deleteProduct
);

module.exports = router;