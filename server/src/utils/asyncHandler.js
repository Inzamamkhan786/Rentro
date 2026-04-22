/**
 * Wraps async Express route handlers to catch errors
 * and forward them to the error handling middleware.
 *
 * @param {Function} fn - Async express handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  if (typeof fn !== 'function') {
    throw new TypeError('asyncHandler requires a function argument');
  }

  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
