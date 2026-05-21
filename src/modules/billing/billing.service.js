const BillingRepository = require('./billing.repository');
const AppError = require('../../common/exceptions/AppError');
const { generateInvoiceNumber } = require('../../common/utils/InvoiceNumberGenerator');
const HeldBillsQueue = require('../../common/utils/HeldBillsQueue');
const { Product } = require('../products/product.model');

/**
 * BillingService — core POS billing business logic.
 *
 * DSA highlight: HeldBillsQueue (DLL + HashMap) gives O(1)
 * hold / resume / discard operations without hitting the database.
 */
class BillingService {
  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Resolves all productIds from the cart, validates stock,
   * and computes line-level totals including GST.
   *
   * Returns { enrichedItems, subtotal, totalTax, totalAmount }
   */
  async _resolveAndComputeCart(items) {
    const productIds = items.map((i) => i.productId);

    // Batch fetch all products in one DB query — O(n) single round-trip
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .select('_id name sku barcode price taxRate stock')
      .lean();

    // Build a HashMap for O(1) product lookup by id
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    let totalTax = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = productMap.get(String(item.productId));

      if (!product) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }
      if (product.stock !== undefined && product.stock < item.qty) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}`,
          400
        );
      }

      const lineTotal = parseFloat((product.price * item.qty).toFixed(2));
      const taxAmount = parseFloat(
        (lineTotal * ((product.taxRate ?? 0) / 100)).toFixed(2)
      );

      subtotal += lineTotal;
      totalTax += taxAmount;

      enrichedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? '',
        price: product.price,
        qty: item.qty,
        taxRate: product.taxRate ?? 0,
        taxAmount,
        lineTotal,
      });
    }

    return {
      enrichedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalAmount: parseFloat((subtotal + totalTax).toFixed(2)),
    };
  }

  /**
   * Atomically decrement stock for all items in the cart.
   * Uses bulkWrite for a single round-trip — efficient for large carts.
   */
  async _decrementStock(enrichedItems) {
    const bulkOps = enrichedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.qty } },
        update: { $inc: { stock: -item.qty } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps, { ordered: false });

    // If any update didn't match (stock went below qty between resolve and write), abort
    if (result.modifiedCount < enrichedItems.length) {
      throw new AppError(
        'Stock changed during checkout. Please refresh and try again.',
        409
      );
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Checkout — create a paid invoice and decrement stock.
   */
  async checkout({ items, paymentMethod, customerId, notes }, cashier) {
    const { enrichedItems, subtotal, totalTax, totalAmount } =
      await this._resolveAndComputeCart(items);

    // Atomic stock decrement before saving bill
    await this._decrementStock(enrichedItems);

    const invoiceNumber = await generateInvoiceNumber();

    const bill = await BillingRepository.create({
      invoiceNumber,
      items: enrichedItems,
      subtotal,
      totalTax,
      totalAmount,
      paymentMethod,
      customerId: customerId || null,
      cashierId: cashier?.id || null,   // JWT payload uses `id` not `_id`
      cashierName: 'POS Cashier',       // Name not stored in JWT; enrich via lookup if needed
      status: 'paid',
      notes,
    });

    return bill;
  }

  /**
   * Hold Bill — push cart snapshot to in-memory HeldBillsQueue (O(1)).
   * No DB write. Returns holdId immediately.
   */
  async holdBill({ items, customerId, notes }) {
    // Lightweight validation — resolve products to capture current prices
    const { enrichedItems, subtotal, totalTax, totalAmount } =
      await this._resolveAndComputeCart(items);

    const cartSnapshot = {
      items: enrichedItems,
      subtotal,
      totalTax,
      totalAmount,
      customerId: customerId || null,
      notes,
    };

    const holdId = HeldBillsQueue.hold(cartSnapshot);
    return { holdId, heldBillsCount: HeldBillsQueue.size };
  }

  /**
   * List all held bills (from in-memory queue).
   * Returns summary rows — no DB query.
   */
  getHeldBills() {
    return HeldBillsQueue.listAll();
  }

  /**
   * Resume a held bill — pop from queue (O(1)), return cart data.
   */
  resumeHeldBill(holdId) {
    const held = HeldBillsQueue.resume(holdId);
    if (!held) {
      throw new AppError('Held bill not found or already resumed', 404);
    }
    return held;
  }

  /**
   * Discard a held bill — remove from queue without processing (O(1)).
   */
  discardHeldBill(holdId) {
    const removed = HeldBillsQueue.discard(holdId);
    if (!removed) {
      throw new AppError('Held bill not found', 404);
    }
    return { message: 'Held bill discarded' };
  }

  /**
   * Get a saved bill/invoice by MongoDB id.
   */
  async getBillById(id) {
    const bill = await BillingRepository.findById(id);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }
    return bill;
  }

  /**
   * Paginated list of bills with optional filters.
   */
  async getBills(query) {
    const { page = 1, limit = 10, status, paymentMethod, from, to } = query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    return await BillingRepository.findAll(filter, parseInt(page), parseInt(limit));
  }

  /**
   * Get structured invoice data for print view.
   * Formats the bill into a print-ready payload.
   */
  async getInvoiceData(id) {
    const bill = await this.getBillById(id);

    return {
      invoiceNumber: bill.invoiceNumber,
      date: bill.createdAt,
      cashierName: bill.cashierName,
      customer: bill.customerId
        ? { name: bill.customerId.name, phone: bill.customerId.phone }
        : null,
      items: bill.items.map((item) => ({
        name: item.name,
        sku: item.sku,
        qty: item.qty,
        price: item.price,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        lineTotal: item.lineTotal,
        lineTotalWithTax: parseFloat((item.lineTotal + item.taxAmount).toFixed(2)),
      })),
      subtotal: bill.subtotal,
      totalTax: bill.totalTax,
      totalAmount: bill.totalAmount,
      paymentMethod: bill.paymentMethod,
      status: bill.status,
    };
  }
}

module.exports = new BillingService();
