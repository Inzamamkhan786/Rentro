const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory using Joi schemas.
 * Validates request body, query, or params against a Joi schema.
 *
 * @param {Object} schema - Joi schema with optional body, query, params keys
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(
          ...error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        // Apply stripped/coerced values back to req.body
        req.body = schema.body.validate(req.body, { stripUnknown: true }).value;
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(
          ...error.details.map((detail) => ({
            field: `query.${detail.path.join('.')}`,
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        req.query = schema.query.validate(req.query, { stripUnknown: true }).value;
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(
          ...error.details.map((detail) => ({
            field: `params.${detail.path.join('.')}`,
            message: detail.message.replace(/"/g, ''),
          }))
        );
      } else {
        req.params = schema.params.validate(req.params, { stripUnknown: true }).value;
      }
    }

    if (errors.length > 0) {
      console.error("Validation error:", errors);
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
};

module.exports = { validate };
