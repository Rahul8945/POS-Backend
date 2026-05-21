const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Grocery Billing API is running smoothly.',
  });
});

const authRoutes = require('../modules/auth/auth.routes');
const productRoutes = require('../modules/products/product.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const billingRoutes = require('../modules/billing/billing.routes');

// Mount domain modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/billing', billingRoutes);

module.exports = router;
