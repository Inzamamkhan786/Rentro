const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware factory.
 * Restricts access to users with specified roles.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'provider')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  if (roles.length === 0) {
    throw new Error('At least one role must be specified');
  }

  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
