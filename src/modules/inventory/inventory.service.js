const InventoryRepository = require('./inventory.repository');
const AppError = require('../../common/exceptions/AppError');
const mongoose = require('mongoose');

class InventoryService {
  async getStockLevel(productId) {
    return await InventoryRepository.getStockByProductId(productId);
  }

  async getAllInventory(query) {
    const { page = 1, limit = 10, lowStock = 'false' } = query;
    return await InventoryRepository.getAllStockLevels(
      parseInt(page), 
      parseInt(limit), 
      { lowStockOnly: lowStock === 'true' }
    );
  }

  async adjustStock(payload) {
    const { productId, quantityChanged, type, notes, referenceId } = payload;

    // We need a transaction to safely update stock and log movement atomically
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const stockDoc = await InventoryRepository.getStockByProductId(productId);
      
      let newQuantity = stockDoc.quantity;

      if (type === 'IN' || type === 'RETURN') {
        newQuantity += quantityChanged;
      } else if (type === 'OUT') {
        if (newQuantity < quantityChanged) {
          throw new AppError('Insufficient stock for this operation', 400);
        }
        newQuantity -= quantityChanged;
      } else if (type === 'ADJUSTMENT') {
        // Here quantityChanged can be positive or negative
        newQuantity += quantityChanged;
        if (newQuantity < 0) {
            throw new AppError('Stock cannot drop below zero in adjustment', 400);
        }
      }

      stockDoc.quantity = newQuantity;
      await stockDoc.save({ session });

      const movement = await InventoryRepository.logMovement({
        product: productId,
        type,
        quantityChanged,
        balanceAfter: newQuantity,
        referenceId,
        notes
      });

      await session.commitTransaction();
      session.endSession();

      return { stock: stockDoc, movement };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updateThreshold(productId, data) {
    const stockDoc = await InventoryRepository.getStockByProductId(productId);
    stockDoc.lowStockThreshold = data.lowStockThreshold;
    
    if (data.location) {
      stockDoc.location = data.location;
    }

    await stockDoc.save();
    return stockDoc;
  }

  async getMovements(productId, query) {
    const { page = 1, limit = 10 } = query;
    return await InventoryRepository.getMovementsHistory(productId, parseInt(page), parseInt(limit));
  }
}

module.exports = new InventoryService();
