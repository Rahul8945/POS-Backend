const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { limiter } = require('./common/middleware/rateLimit.middleware');
const globalErrorHandler = require('./common/middleware/error.middleware');
const AppError = require('./common/exceptions/AppError');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross Origin Resource Sharing
app.use(cors());

// Parse cookies
app.use(cookieParser());

// Limit requests from same API
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Route handlers
app.use('/api/v1', routes);

// Handle unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
