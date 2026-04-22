const Joi = require('joi');

const createBookingSchema = {
  body: Joi.object({
    vehicleId: Joi.number().integer().required(),
    startDate: Joi.date().iso().min('now').required().messages({
      'date.min': 'Start date must be in the future',
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.greater': 'End date must be after start date',
    }),
  }),
};

const updateBookingStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid('confirmed', 'active', 'completed', 'cancelled')
      .required(),
  }),
};

const cancelBookingSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).optional(),
  }),
};

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
};
