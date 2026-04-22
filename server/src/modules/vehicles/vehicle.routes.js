const express = require('express');
const router = express.Router();
const vehicleController = require('./vehicle.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { uploadVehicleImages } = require('../../middleware/upload.middleware');
const { createVehicleSchema, updateVehicleSchema, checkAvailabilitySchema } = require('./vehicle.validation');

// Public routes
router.get('/', optionalAuth, vehicleController.getVehicles);
router.get('/:id', optionalAuth, vehicleController.getVehicleById);
router.get('/:id/availability', validate(checkAvailabilitySchema), vehicleController.checkAvailability);

// Provider routes
router.post('/images', authenticate, authorize('provider', 'admin'), uploadVehicleImages, vehicleController.uploadImages);
router.post('/', authenticate, authorize('provider', 'admin'), validate(createVehicleSchema), vehicleController.createVehicle);
router.get('/my/listings', authenticate, authorize('provider', 'admin'), vehicleController.getMyVehicles);
router.put('/:id', authenticate, authorize('provider', 'admin'), validate(updateVehicleSchema), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize('provider', 'admin'), vehicleController.deleteVehicle);

// Admin routes
router.put('/:id/verify', authenticate, authorize('admin'), vehicleController.verifyVehicle);

module.exports = router;
