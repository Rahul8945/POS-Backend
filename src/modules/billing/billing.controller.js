const BillingService = require('./billing.service');
const { SendResponse } = require('../../common/utils/responseFormatter');

class BillingController {
  // ─── Checkout ─────────────────────────────────────────────────────────────

  async checkout(req, res, next) {
    try {
      const bill = await BillingService.checkout(req.body, req.user);
      SendResponse(res, 201, true, 'Bill created successfully', bill);
    } catch (error) {
      next(error);
    }
  }

  // ─── Hold Bill ───────────────────────────────────────────────────────────

  async holdBill(req, res, next) {
    try {
      const result = await BillingService.holdBill(req.body);
      SendResponse(res, 200, true, 'Bill held successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getHeldBills(req, res, next) {
    try {
      const held = BillingService.getHeldBills();
      SendResponse(res, 200, true, 'Held bills retrieved', held);
    } catch (error) {
      next(error);
    }
  }

  async resumeHeldBill(req, res, next) {
    try {
      const result = BillingService.resumeHeldBill(req.params.holdId);
      SendResponse(res, 200, true, 'Held bill resumed', result);
    } catch (error) {
      next(error);
    }
  }

  async discardHeldBill(req, res, next) {
    try {
      const result = BillingService.discardHeldBill(req.params.holdId);
      SendResponse(res, 200, true, 'Held bill discarded', result);
    } catch (error) {
      next(error);
    }
  }

  // ─── Saved Bills ─────────────────────────────────────────────────────────

  async getBills(req, res, next) {
    try {
      const { data, total } = await BillingService.getBills(req.query);
      const { page = 1, limit = 10 } = req.query;
      const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      };
      SendResponse(res, 200, true, 'Bills retrieved successfully', data, meta);
    } catch (error) {
      next(error);
    }
  }

  async getBillById(req, res, next) {
    try {
      const bill = await BillingService.getBillById(req.params.id);
      SendResponse(res, 200, true, 'Bill retrieved successfully', bill);
    } catch (error) {
      next(error);
    }
  }

  // ─── Invoice Print ───────────────────────────────────────────────────────

  async getInvoiceData(req, res, next) {
    try {
      const invoice = await BillingService.getInvoiceData(req.params.id);
      SendResponse(res, 200, true, 'Invoice data retrieved', invoice);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillingController();
