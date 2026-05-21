const { z } = require('zod');

const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
    quantityChanged: z.number(),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
    notes: z.string().optional(),
    referenceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Ref ID').optional(),
  })
});

const updateThresholdSchema = z.object({
  body: z.object({
    lowStockThreshold: z.number().min(0, 'Threshold must be non-negative'),
    location: z.string().optional(),
  })
});

module.exports = {
  adjustStockSchema,
  updateThresholdSchema,
};
