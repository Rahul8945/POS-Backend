const express = require('express');
const ProductController = require('./product.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { createProductSchema, updateProductSchema } = require('./product.validation');
const { posSearchSchema } = require('../billing/billing.validation');
const { protect } = require('../../common/middleware/auth.middleware');
const { restrictTo } = require('../../common/middleware/role.middleware');
const { ROLES } = require('../../common/constants/roles.constant');

const router = express.Router();

// Only authenticated users can access product endpoints
router.use(protect);

// ─── POS Search (fast product lookup for billing screen) ──────────────────────
// Must be defined BEFORE /:id to avoid route shadowing
router.get('/pos-search', validate(posSearchSchema), ProductController.posSearch);

router
  .route('/')
  .get(ProductController.getAllProducts)
  .post(
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
    validate(createProductSchema),
    ProductController.createProduct
  );

router
  .route('/:id')
  .get(ProductController.getProduct)
  .patch(
    restrictTo(ROLES.ADMIN, ROLES.MANAGER),
    validate(updateProductSchema),
    ProductController.updateProduct
  )
  .delete(
    restrictTo(ROLES.ADMIN),
    ProductController.deleteProduct
  );

module.exports = router;
