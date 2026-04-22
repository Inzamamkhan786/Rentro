const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Global error handling middleware.
 * Catches all errors and returns standardized JSON responses.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    error = ApiError.badRequest('Validation Error', messages);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    error = ApiError.conflict(`${field} already exists`);
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = ApiError.badRequest('Referenced resource does not exist');
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    error = ApiError.badRequest('Database error: ' + err.message);
  }

  // JWT errors (if not caught in auth middleware)
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token has expired');
  }

  // Default status code
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    statusCode,
    message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(env.isDevelopment() && { stack: err.stack }),
  };

  // Log server errors
  if (statusCode >= 500) {
    console.error('🔴 Server Error:', err);
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler for unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFoundHandler };
