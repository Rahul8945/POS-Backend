const InventoryService = require('./inventory.service');
const { SendResponse } = require('../../common/utils/responseFormatter');

class InventoryController {
  async getAllStock(req, res, next) {
    try {
      const { data, total } = await InventoryService.getAllInventory(req.query);
      
      const meta = {
        total,
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10),
      };

      SendResponse(res, 200, true, 'Inventory fetched successfully', data, meta);
    } catch (error) {
      next(error);
    }
  }

  async getProductStock(req, res, next) {
    try {
      const stock = await InventoryService.getStockLevel(req.params.productId);
      SendResponse(res, 200, true, 'Product stock retrieved successfully', stock);
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const result = await InventoryService.adjustStock(req.body);
      SendResponse(res, 200, true, 'Stock adjusted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async updateThreshold(req, res, next) {
    try {
      const result = await InventoryService.updateThreshold(req.params.productId, req.body);
      SendResponse(res, 200, true, 'Threshold updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req, res, next) {
    try {
      const { data, total } = await InventoryService.getMovements(req.params.productId, req.query);
      const meta = { total, page: parseInt(req.query.page || 1), limit: parseInt(req.query.limit || 10) };
      SendResponse(res, 200, true, 'Stock movements retrieved', data, meta);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
