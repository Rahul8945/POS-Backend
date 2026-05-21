const { z } = require('zod');

// ─── Shared item shape ──────────────────────────────────────────────────────
const cartItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  qty: z.number().int().min(1, 'qty must be at least 1'),
});

// ─── Checkout ───────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  body: z.object({
    items: z
      .array(cartItemSchema)
      .min(1, 'Cart must have at least one item'),
    paymentMethod: z.enum(['cash', 'upi', 'card'], {
      errorMap: () => ({ message: 'paymentMethod must be cash, upi, or card' }),
    }),
    customerId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// ─── Hold Bill ──────────────────────────────────────────────────────────────
const holdBillSchema = z.object({
  body: z.object({
    items: z
      .array(cartItemSchema)
      .min(1, 'Cart must have at least one item'),
    customerId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// ─── List Bills query ───────────────────────────────────────────────────────
const listBillsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['paid', 'cancelled']).optional(),
    from: z.string().optional(), // ISO date string
    to: z.string().optional(),   // ISO date string
    paymentMethod: z.enum(['cash', 'upi', 'card']).optional(),
  }),
});

// ─── POS Product Search query ────────────────────────────────────────────────
const posSearchSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query (q) is required'),
    limit: z.string().optional(),
  }),
});

module.exports = {
  checkoutSchema,
  holdBillSchema,
  listBillsSchema,
  posSearchSchema,
};
