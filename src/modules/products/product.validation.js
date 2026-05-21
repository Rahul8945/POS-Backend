const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    discountPrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    barcode: z.string().optional(),
  }).refine((data) => {
    if (data.discountPrice !== undefined) {
      return data.discountPrice < data.price;
    }
    return true;
  }, {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"]
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    discountPrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    barcode: z.string().optional(),
    isActive: z.boolean().optional(),
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
