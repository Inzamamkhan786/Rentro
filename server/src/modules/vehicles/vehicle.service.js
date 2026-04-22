const { Op } = require('sequelize');
const { Vehicle, User, Booking } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination } = require('../../utils/helpers');

/**
 * Create a new vehicle listing.
 * @param {number} ownerId
 * @param {Object} vehicleData
 * @returns {Promise<Object>}
 */
const createVehicle = async (ownerId, vehicleData) => {
  const owner = await User.findByPk(ownerId);
  if (!owner) {
    throw ApiError.notFound('Owner not found');
  }
  if (owner.role !== 'provider') {
    throw ApiError.forbidden('Only providers can list vehicles');
  }

  const vehicle = await Vehicle.create({
    ...vehicleData,
    ownerId,
    verified: false,
  });

  return vehicle;
};

/**
 * Get vehicles with filters and pagination.
 * @param {Object} query - Filter parameters
 * @returns {Promise<{ vehicles: Array, total: number, page: number, limit: number }>}
 */
const getVehicles = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.type) {
    where.type = query.type;
  }
  if (query.location) {
    where.location = { [Op.like]: `%${query.location}%` };
  }
  if (query.minPrice) {
    where.pricePerDay = { ...where.pricePerDay, [Op.gte]: parseFloat(query.minPrice) };
  }
  if (query.maxPrice) {
    where.pricePerDay = { ...where.pricePerDay, [Op.lte]: parseFloat(query.maxPrice) };
  }
  if (query.availability !== undefined) {
    where.availability = query.availability === 'true';
  }
  if (query.verified !== undefined) {
    where.verified = query.verified === 'true';
  }
  if (query.brand) {
    where.brand = { [Op.like]: `%${query.brand}%` };
  }

  const { count, rows } = await Vehicle.findAndCountAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { vehicles: rows, total: count, page, limit };
};

/**
 * Get a single vehicle by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findByPk(id, {
    include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar', 'phone'] }],
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  return vehicle;
};

/**
 * Update a vehicle listing.
 * @param {number} id
 * @param {number} ownerId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const updateVehicle = async (id, ownerId, data) => {
  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (vehicle.ownerId !== ownerId) {
    throw ApiError.forbidden('You can only update your own vehicles');
  }

  // Prevent updating certain fields
  const allowedFields = [
    'title', 'type', 'brand', 'model', 'year', 'pricePerHour',
    'pricePerDay', 'location', 'images', 'availability', 'specs', 'description',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  await vehicle.update(updateData);
  return vehicle;
};

/**
 * Delete a vehicle listing.
 * @param {number} id
 * @param {number} ownerId
 * @returns {Promise<void>}
 */
const deleteVehicle = async (id, ownerId) => {
  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (vehicle.ownerId !== ownerId) {
    throw ApiError.forbidden('You can only delete your own vehicles');
  }

  // Check for active bookings
  const activeBookings = await Booking.count({
    where: {
      vehicleId: id,
      status: { [Op.in]: ['confirmed', 'active'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest('Cannot delete vehicle with active bookings');
  }

  await vehicle.destroy();
};

/**
 * Get vehicles owned by a specific user.
 * @param {number} ownerId
 * @returns {Promise<Array>}
 */
const getVehiclesByOwner = async (ownerId) => {
  const vehicles = await Vehicle.findAll({
    where: { ownerId },
    order: [['created_at', 'DESC']],
  });

  return vehicles;
};

/**
 * Admin: Verify a vehicle.
 * @param {number} id
 * @returns {Promise<Object>}
 */
const verifyVehicle = async (id) => {
  const vehicle = await Vehicle.findByPk(id);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  await vehicle.update({ verified: true });
  return vehicle;
};

/**
 * Check vehicle availability for a date range.
 * @param {number} vehicleId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<{ available: boolean, conflicts: Array }>}
 */
const checkAvailability = async (vehicleId, startDate, endDate) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (!vehicle.availability) {
    return { available: false, conflicts: ['Vehicle is marked as unavailable'] };
  }

  // Check for overlapping bookings
  const conflicts = await Booking.findAll({
    where: {
      vehicleId,
      status: { [Op.in]: ['confirmed', 'active', 'pending'] },
      [Op.or]: [
        {
          startDate: { [Op.lt]: new Date(endDate) },
          endDate: { [Op.gt]: new Date(startDate) },
        },
      ],
    },
  });

  return {
    available: conflicts.length === 0,
    conflicts: conflicts.map((b) => ({
      bookingId: b.id,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
    })),
  };
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehiclesByOwner,
  verifyVehicle,
  checkAvailability,
};
