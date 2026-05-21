const express = require('express');
const InventoryController = require('./inventory.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { adjustStockSchema, updateThresholdSchema } = require('./inventory.validation');
const { protect } = require('../../common/middleware/auth.middleware');
const { restrictTo } = require('../../common/middleware/role.middleware');
const { ROLES } = require('../../common/constants/roles.constant');

const router = express.Router();

router.use(protect); // All routes protected

// Inventory Overview
router.get('/', restrictTo(ROLES.ADMIN, ROLES.MANAGER), InventoryController.getAllStock);

// Product specific inventory ops
router.get('/:productId', InventoryController.getProductStock);
router.get('/:productId/movements', restrictTo(ROLES.ADMIN, ROLES.MANAGER), InventoryController.getMovements);
router.patch('/:productId/threshold', restrictTo(ROLES.ADMIN, ROLES.MANAGER), validate(updateThresholdSchema), InventoryController.updateThreshold);

// Atomic Stock Adjustments (IN, OUT, ADJUSTMENT)
router.post('/adjust', restrictTo(ROLES.ADMIN, ROLES.MANAGER), validate(adjustStockSchema), InventoryController.adjustStock);

module.exports = router;
