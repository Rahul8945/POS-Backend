const { Bill } = require('./billing.model');

class BillingRepository {
  /**
   * Persist a new bill to the database.
   */
  async create(data) {
    return await Bill.create(data);
  }

  /**
   * Find a single bill by MongoDB _id, optionally populating refs.
   */
  async findById(id) {
    return await Bill.findById(id)
      .populate('customerId', 'name phone email')
      .populate('cashierId', 'name email')
      .lean();
  }

  /**
   * Paginated list of bills with optional filters.
   * @param {object} filter  - MongoDB filter object
   * @param {number} page    - 1-indexed page
   * @param {number} limit   - items per page
   */
  async findAll(filter = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .lean(),
      Bill.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Cancel a bill (soft update — keeps record for audit).
   */
  async cancel(id) {
    return await Bill.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    ).lean();
  }
}

module.exports = new BillingRepository();
