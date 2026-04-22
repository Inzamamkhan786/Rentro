const Joi = require('joi');

const createVehicleSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    type: Joi.string().valid('car', 'bike', 'scooter').required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
    pricePerHour: Joi.number().min(0).required(),
    pricePerDay: Joi.number().min(0).required(),
    location: Joi.string().required(),
    images: Joi.array().items(Joi.string()).optional(),
    specs: Joi.object().optional(),
    description: Joi.string().max(2000).optional(),
  }),
};

const updateVehicleSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    type: Joi.string().valid('car', 'bike', 'scooter').optional(),
    brand: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).optional(),
    pricePerHour: Joi.number().min(0).optional(),
    pricePerDay: Joi.number().min(0).optional(),
    location: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    availability: Joi.boolean().optional(),
    specs: Joi.object().optional(),
    description: Joi.string().max(2000).optional(),
  }).min(1),
};

const checkAvailabilitySchema = {
  query: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  }),
};

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  checkAvailabilitySchema,
};
