const { Inventory, InventoryMovement } = require('./inventory.model');

class InventoryRepository {
  async getStockByProductId(productId) {
    let stock = await Inventory.findOne({ product: productId }).populate('product', 'name sku price');
    // Auto-initialize if it doesn't exist
    if (!stock) {
      stock = await Inventory.create({ product: productId, quantity: 0 });
    }
    return stock;
  }

  async getAllStockLevels(page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    
    // Support filtering for low stock globally
    let queryFilter = filter;
    if (filter.lowStockOnly) {
       queryFilter = { $expr: { $lte: ['$quantity', '$lowStockThreshold'] } };
    }

    const query = Inventory.find(queryFilter)
      .populate('product', 'name sku barcode isActive')
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(queryFilter);
    return { data: await query, total };
  }

  async logMovement(movementData) {
    return await InventoryMovement.create(movementData);
  }

  async getMovementsHistory(productId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = productId ? { product: productId } : {};
    
    const query = InventoryMovement.find(filter)
      .populate('product', 'name sku')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
      
    const total = await InventoryMovement.countDocuments(filter);
    return { data: await query, total };
  }

  async updateStockAndThresholds(inventoryId, updateData) {
    return await Inventory.findByIdAndUpdate(inventoryId, updateData, { new: true });
  }
}

module.exports = new InventoryRepository();
