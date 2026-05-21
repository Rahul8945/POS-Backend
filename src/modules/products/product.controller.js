const ProductService = require('./product.service');
const { SendResponse } = require('../../common/utils/responseFormatter');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      SendResponse(res, 201, true, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const { data, total } = await ProductService.getAllProducts(req.query);
      
      const { page = 1, limit = 10 } = req.query;
      const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      };

      SendResponse(res, 200, true, 'Products retrieved successfully', data, meta);
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      SendResponse(res, 200, true, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      SendResponse(res, 200, true, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id);
      SendResponse(res, 200, true, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async posSearch(req, res, next) {
    try {
      const { q, limit } = req.query;
      const products = await ProductService.posSearch(q, limit);
      SendResponse(res, 200, true, 'Products found', products);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
