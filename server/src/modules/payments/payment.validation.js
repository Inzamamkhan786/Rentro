const Joi = require('joi');

const createPaymentSchema = {
  body: Joi.object({
    bookingId: Joi.number().integer().required(),
  }),
};

const confirmPaymentSchema = {
  body: Joi.object({
    paymentIntentId: Joi.string().required(),
  }),
};

const refundSchema = {
  body: Joi.object({
    bookingId: Joi.number().integer().required(),
    amount: Joi.number().min(0).optional(),
  }),
};

module.exports = {
  createPaymentSchema,
  confirmPaymentSchema,
  refundSchema,
};
