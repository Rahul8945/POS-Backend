const ProductRepository = require('./product.repository');
const AppError = require('../../common/exceptions/AppError');

class ProductService {
  async createProduct(productData) {
    // Check if SKU or Barcode already exists (handled slightly by Mongoose unique index, but better to check nicely)
    const existing = await ProductRepository.findBySkuOrBarcode(productData.sku);
    if (existing) {
      throw new AppError(`Product with SKU ${productData.sku} already exists`, 400);
    }
    return await ProductRepository.create(productData);
  }

  async getAllProducts(query) {
    // Extract basic filtering and pagination
    const { page = 1, limit = 10, search, category, active } = query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    return await ProductRepository.findAll(filter, parseInt(page), parseInt(limit));
  }

  async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id, updateData) {
    const product = await ProductRepository.update(id, updateData);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await ProductRepository.delete(id);
    if (!product) {
       throw new AppError('Product not found', 404);
    }
    return true;
  }

  /**
   * POS fast search — barcode exact → SKU exact → full-text name.
   * Backed by the triaged strategy in ProductRepository.posSearch.
   */
  async posSearch(q, limit = 20) {
    if (!q || !q.trim()) {
      throw new AppError('Search query is required', 400);
    }
    return await ProductRepository.posSearch(q.trim(), parseInt(limit));
  }
}

module.exports = new ProductService();
