/**
 * Custom API Error class for standardized error handling.
 * Extends the native Error class with HTTP status codes.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Additional error details
   * @param {boolean} isOperational - Whether this is an operational error
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 400 Bad Request
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * 401 Unauthorized
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * 403 Forbidden
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * 404 Not Found
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * 409 Conflict
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /**
   * 422 Unprocessable Entity
   */
  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  /**
   * 500 Internal Server Error
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, [], false);
  }
}

module.exports = ApiError;
