const { SendResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const env = require('../../config/env.config');
const AppError = require('../exceptions/AppError');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  // Production Error Handling
  let error = { ...err, message: err.message };

  // MongoDB Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}.`;
    error = new AppError(message, 400);
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    error = new AppError(message, 400);
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  if (error.isOperational) {
    SendResponse(res, error.statusCode, false, error.message);
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    SendResponse(res, 500, false, 'Something went very wrong!');
  }
};

module.exports = globalErrorHandler;
