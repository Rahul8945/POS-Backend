const rateLimit = require('express-rate-limit');
const env = require('../../config/env.config');
const AppError = require('../exceptions/AppError');

const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW) * 60 * 1000, 
  max: parseInt(env.RATE_LIMIT_MAX), 
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res, next, options) => {
    next(new AppError(options.message, 429));
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = { limiter };
