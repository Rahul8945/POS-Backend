const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Inventory record must be tied to a Product'],
      unique: true, // 1:1 relation with product summary
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    location: {
      type: String,
      default: 'Main Warehouse',
    },
  },
  { timestamps: true }
);

const inventoryMovementSchema = new mongoose.Schema({
  product: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Product',
     required: true
  },
  type: {
     type: String,
     enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'],
     required: true
  },
  quantityChanged: {
     type: Number,
     required: true
  },
  balanceAfter: {
     type: Number,
     required: true
  },
  referenceId: {
     type: mongoose.Schema.Types.ObjectId, // Could be PurchaseId or BillId
     default: null
  },
  notes: {
     type: String,
     default: ''
  }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = { Inventory, InventoryMovement };
