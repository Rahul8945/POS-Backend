const AppError = require('../exceptions/AppError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by auth middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = { restrictTo };
