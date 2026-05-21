// --- REDIS TEMPORARILY DISABLED (uncomment below to re-enable) ---
// const { Redis } = require('ioredis');
// const env = require('./env.config');
// const logger = require('../common/utils/logger'); // Will exist after step 3

// const redisClient = new Redis({
//   host: env.REDIS_HOST,
//   port: parseInt(env.REDIS_PORT, 10),
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   },
// });

// redisClient.on('connect', () => {
//   logger.info('Redis connection established successfully');
// });

// redisClient.on('error', (err) => {
//   logger.error(`Redis connection Error: ${err.message}`);
// });

// module.exports = redisClient;
// --- END REDIS ---

// Stub: replace with redisClient above when Redis is re-enabled
const redisClient = {
  get: async () => null,
  set: async () => null,
};

module.exports = redisClient;
