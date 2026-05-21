const { Product } = require('./product.model');
const mongoose = require('mongoose');

class ProductRepository {
  async create(data) {
    return await Product.create(data);
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async findBySkuOrBarcode(identifier) {
    return await Product.findOne({
      $or: [{ sku: identifier }, { barcode: identifier }],
    });
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const query = Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
      
    const total = await Product.countDocuments(filter);
    
    return { data: await query, total };
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  /**
   * POS fast search — used by the billing screen product panel.
   * Strategy (in priority order):
   *   1. Exact barcode match  → instant O(1) index lookup
   *   2. Exact SKU match      → instant O(1) index lookup
   *   3. Full-text name search → uses MongoDB text index
   *
   * Returns lightweight projection only (no description / timestamps).
   */
  async posSearch(q, limit = 20) {
    const projection = { name: 1, sku: 1, barcode: 1, price: 1, taxRate: 1, stock: 1, category: 1 };
    const baseFilter = { isActive: true };

    // 1. Try exact barcode match first (most common POS scanner workflow)
    const byBarcode = await Product.findOne({ ...baseFilter, barcode: q }, projection).lean();
    if (byBarcode) return [byBarcode];

    // 2. Try exact SKU match
    const bySku = await Product.findOne({ ...baseFilter, sku: q }, projection).lean();
    if (bySku) return [bySku];

    // 3. Full-text search on name / description
    const byText = await Product.find(
      { ...baseFilter, $text: { $search: q } },
      { ...projection, score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return byText;
  }
}

module.exports = new ProductRepository();
