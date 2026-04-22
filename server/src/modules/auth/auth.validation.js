const Joi = require('joi');

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be at most 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Must be a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    role: Joi.string().valid('consumer', 'provider').default('consumer').messages({
      'any.only': 'Role must be consumer or provider',
    }),
    phone: Joi.string().max(20).optional().allow(''),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Must be a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required',
    }),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
