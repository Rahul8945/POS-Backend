const jwt = require('jsonwebtoken');
const AppError = require('../exceptions/AppError');
const env = require('../../config/env.config');
const { SendResponse } = require('../utils/responseFormatter');
const redisClient = require('../../config/redis.config');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Check if token is blacklisted in Redis (e.g., after logout/password change)
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
       return next(new AppError('Token is no longer valid. Please log in again.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // We attach decoded userId and role to request. 
    // Usually we would fetch the User from DB here to ensure they still exist,
    // but caching user details in the token reduces DB load.
    req.user = decoded;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
