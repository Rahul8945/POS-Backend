const { Counter } = require('../models/Counter.model');

/**
 * Generates a unique, sequential invoice number.
 * Format: INV-YYYYMMDD-XXXX (e.g. INV-20260430-0042)
 *
 * Uses MongoDB's atomic $inc on the Counter model — safe under concurrent requests.
 */
async function generateInvoiceNumber() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // "20260430"
  const counterKey = `invoice-${datePart}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(4, '0');
  return `INV-${datePart}-${seq}`;
}

module.exports = { generateInvoiceNumber };
