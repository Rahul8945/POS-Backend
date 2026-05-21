const mongoose = require('mongoose');

/**
 * BillItem — sub-document for each line item in a bill.
 * Snapshot of product details at time of sale (price may change later).
 */
const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    barcode: { type: String },
    price: { type: Number, required: true, min: 0 },     // Unit price at time of sale
    qty: { type: Number, required: true, min: 1 },
    taxRate: { type: Number, default: 0 },               // GST % e.g. 5, 12, 18
    taxAmount: { type: Number, default: 0 },             // Tax for this line
    lineTotal: { type: Number, required: true, min: 0 }, // price * qty (excl. tax)
  },
  { _id: false }
);

/**
 * Bill Schema — represents one completed transaction or held session.
 */
const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,  // Held bills don't have an invoice number yet
      index: true,
    },
    items: {
      type: [billItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A bill must have at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },   // Sum of lineTotals (excl. tax)
    totalTax: { type: Number, required: true, min: 0 },   // Sum of all taxAmounts
    totalAmount: { type: Number, required: true, min: 0 }, // subtotal + totalTax
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card'],
      required: function () {
        return this.status === 'paid'; // Only required on paid bills
      },
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cashierName: { type: String, default: 'POS Cashier' },
    status: {
      type: String,
      enum: ['paid', 'cancelled'],
      default: 'paid',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index for fast dashboard queries (date range + status)
billSchema.index({ createdAt: -1, status: 1 });

const Bill = mongoose.model('Bill', billSchema);
module.exports = { Bill };
