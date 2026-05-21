const winston = require('winston');
const loggerConfig = require('../../config/logger.config');

const logger = winston.createLogger(loggerConfig);

module.exports = logger;
