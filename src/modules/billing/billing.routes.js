const express = require('express');
const BillingController = require('./billing.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { protect } = require('../../common/middleware/auth.middleware');
const {
  checkoutSchema,
  holdBillSchema,
  listBillsSchema,
} = require('./billing.validation');

const router = express.Router();

// All billing routes require authentication
router.use(protect);

// ─── Hold Bill (in-memory, O(1) via HeldBillsQueue) ──────────────────────────
router.post('/hold', validate(holdBillSchema), BillingController.holdBill);
router.get('/held', BillingController.getHeldBills);
router.post('/held/:holdId/resume', BillingController.resumeHeldBill);
router.delete('/held/:holdId', BillingController.discardHeldBill);

// ─── Checkout (create invoice + decrement stock) ──────────────────────────────
router.post('/checkout', validate(checkoutSchema), BillingController.checkout);

// ─── Saved Bills ──────────────────────────────────────────────────────────────
router.get('/', validate(listBillsSchema), BillingController.getBills);
router.get('/:id/invoice', BillingController.getInvoiceData);
router.get('/:id', BillingController.getBillById);

module.exports = router;
