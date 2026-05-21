const mongoose = require('mongoose');

/**
 * Counter Model — used for atomic sequential invoice numbering.
 * Uses MongoDB's findOneAndUpdate + $inc for race-condition-safe increments.
 */
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = { Counter };
