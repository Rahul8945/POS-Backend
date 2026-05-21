const app = require('./app');
const env = require('./config/env.config');
const connectDB = require('./config/db.config');
const logger = require('./common/utils/logger');

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// DB connection
connectDB();

const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`App is running on port ${PORT} in ${env.NODE_ENV} mode.`);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
