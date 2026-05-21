/**
 * HeldBillsQueue — DSA: Doubly Linked List + HashMap
 *
 * Provides O(1) hold, resume, and discard operations for POS held bills.
 * Auto-evicts the oldest held bill when capacity is exceeded (LRU-style).
 *
 * Structure:
 *   Map<holdId, Node>  ← O(1) access by ID
 *   head               ← most recently held (newest)
 *   tail               ← oldest (evicted first when full)
 */

const { v4: uuidv4 } = require('uuid');

class Node {
  constructor(holdId, data) {
    this.holdId = holdId;
    this.data = data;         // Cart payload snapshot
    this.heldAt = new Date();
    this.prev = null;
    this.next = null;
  }
}

class HeldBillsQueue {
  constructor(capacity = 20) {
    this.capacity = capacity;
    this.map = new Map();   // holdId -> Node

    // Sentinel head & tail (dummy nodes) — simplifies edge cases
    this.head = new Node(null, null); // newest end
    this.tail = new Node(null, null); // oldest end
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  _insertAfterHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  _evictOldest() {
    const oldest = this.tail.prev;
    if (oldest === this.head) return null; // Empty
    this._removeNode(oldest);
    this.map.delete(oldest.holdId);
    return oldest;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Hold a bill. Returns the generated holdId.
   * If at capacity, evicts the oldest held bill automatically.
   * Time complexity: O(1)
   */
  hold(cartData) {
    if (this.map.size >= this.capacity) {
      this._evictOldest();
    }
    const holdId = uuidv4();
    const node = new Node(holdId, cartData);
    this._insertAfterHead(node);
    this.map.set(holdId, node);
    return holdId;
  }

  /**
   * Resume (pop) a held bill by holdId.
   * Removes it from the queue and returns its cart data.
   * Time complexity: O(1)
   */
  resume(holdId) {
    const node = this.map.get(holdId);
    if (!node) return null;
    this._removeNode(node);
    this.map.delete(holdId);
    return { holdId: node.holdId, data: node.data, heldAt: node.heldAt };
  }

  /**
   * Discard a held bill without resuming.
   * Time complexity: O(1)
   */
  discard(holdId) {
    const node = this.map.get(holdId);
    if (!node) return false;
    this._removeNode(node);
    this.map.delete(holdId);
    return true;
  }

  /**
   * List all currently held bills (newest first).
   * Time complexity: O(n)
   */
  listAll() {
    const result = [];
    let current = this.head.next;
    while (current !== this.tail) {
      result.push({
        holdId: current.holdId,
        heldAt: current.heldAt,
        itemCount: current.data?.items?.length ?? 0,
        totalAmount: current.data?.totalAmount ?? 0,
      });
      current = current.next;
    }
    return result;
  }

  /**
   * Current number of held bills.
   */
  get size() {
    return this.map.size;
  }
}

// Export as a singleton so all requests share the same queue
module.exports = new HeldBillsQueue(20);
