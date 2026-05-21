const env = require('./env.config');

const queueConnection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
};

module.exports = {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};
