const vehicleService = require('./vehicle.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/vehicles
 */
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.userId, req.body);
  res.status(201).json(ApiResponse.created(vehicle));
});

/**
 * GET /api/vehicles
 */
const getVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.getVehicles(req.query);
  res.status(200).json(ApiResponse.paginated(result.vehicles, result.page, result.limit, result.total));
});

/**
 * GET /api/vehicles/:id
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(vehicle));
});

/**
 * PUT /api/vehicles/:id
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(
    parseInt(req.params.id, 10),
    req.userId,
    req.body
  );
  res.status(200).json(ApiResponse.ok(vehicle, 'Vehicle updated'));
});

/**
 * DELETE /api/vehicles/:id
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(parseInt(req.params.id, 10), req.userId);
  res.status(200).json(ApiResponse.ok(null, 'Vehicle deleted'));
});

/**
 * GET /api/vehicles/my/listings
 */
const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getVehiclesByOwner(req.userId);
  res.status(200).json(ApiResponse.ok(vehicles));
});

/**
 * GET /api/vehicles/:id/availability
 */
const checkAvailability = asyncHandler(async (req, res) => {
  const result = await vehicleService.checkAvailability(
    parseInt(req.params.id, 10),
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(ApiResponse.ok(result));
});

/**
 * PUT /api/vehicles/:id/verify
 */
const verifyVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.verifyVehicle(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(vehicle, 'Vehicle verified'));
});

/**
 * POST /api/vehicles/images
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No images provided');
  }
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  res.status(200).json(ApiResponse.ok({ urls }, 'Images uploaded successfully'));
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
  checkAvailability,
  verifyVehicle,
  uploadImages,
};
