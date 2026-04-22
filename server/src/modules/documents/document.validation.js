const Joi = require('joi');

const uploadDocumentSchema = {
  body: Joi.object({
    type: Joi.string().valid('DL', 'RC', 'PUC', 'Aadhar', 'PAN', 'VoterID', 'RationCard').required(),
    fileUrl: Joi.string().optional(),
    vehicleId: Joi.number().integer().optional(),
  }),
};

const verifyDocumentSchema = {
  body: Joi.object({
    status: Joi.string().valid('verified', 'rejected').required(),
    reason: Joi.string().max(500).when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

module.exports = {
  uploadDocumentSchema,
  verifyDocumentSchema,
};
