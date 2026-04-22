const { Op } = require('sequelize');
const { Booking, Vehicle, User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { calculateRentalPrice, getPagination } = require('../../utils/helpers');

/**
 * Create a new booking.
 * @param {number} userId
 * @param {number} vehicleId
 * @param {Object} dates - { startDate, endDate }
 * @returns {Promise<Object>}
 */
const createBooking = async (userId, vehicleId, dates) => {
  const { startDate, endDate } = dates;

  // Validate vehicle exists and is available
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (!vehicle.availability) {
    throw ApiError.badRequest('Vehicle is not available for booking');
  }

  if (!vehicle.verified) {
    throw ApiError.badRequest('Vehicle is not yet verified');
  }

  // Prevent booking own vehicle
  if (vehicle.ownerId === userId) {
    throw ApiError.badRequest('You cannot book your own vehicle');
  }

  // Check for conflicting bookings
  const conflicts = await Booking.findAll({
    where: {
      vehicleId,
      status: { [Op.in]: ['pending', 'confirmed', 'active'] },
      [Op.or]: [
        {
          startDate: { [Op.lt]: new Date(endDate) },
          endDate: { [Op.gt]: new Date(startDate) },
        },
      ],
    },
  });

  if (conflicts.length > 0) {
    throw ApiError.conflict('Vehicle is already booked for the selected dates');
  }

  // Calculate total price
  const totalPrice = calculateRentalPrice(
    parseFloat(vehicle.pricePerHour),
    parseFloat(vehicle.pricePerDay),
    startDate,
    endDate
  );

  const booking = await Booking.create({
    userId,
    vehicleId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    totalPrice,
    status: 'pending',
    paymentStatus: 'pending',
  });

  return booking;
};

/**
 * Get booking by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
const getBookingById = async (id) => {
  const booking = await Booking.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      {
        model: Vehicle, as: 'vehicle',
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      },
    ],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  return booking;
};

/**
 * Get bookings for a renter.
 * @param {number} userId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getUserBookings = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const where = { userId };

  if (query.status) {
    where.status = query.status;
  }

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'title', 'type', 'brand', 'model', 'images'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { bookings: rows, total: count, page, limit };
};

/**
 * Get bookings for a provider's vehicles.
 * @param {number} ownerId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getProviderBookings = async (ownerId, query) => {
  const { page, limit, offset } = getPagination(query);

  // Get provider's vehicle IDs
  const vehicles = await Vehicle.findAll({
    where: { ownerId },
    attributes: ['id'],
  });
  const vehicleIds = vehicles.map((v) => v.id);

  if (vehicleIds.length === 0) {
    return { bookings: [], total: 0, page, limit };
  }

  const where = { vehicleId: { [Op.in]: vehicleIds } };
  if (query.status) {
    where.status = query.status;
  }

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'title', 'type', 'brand', 'model'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { bookings: rows, total: count, page, limit };
};

/**
 * Update booking status.
 * @param {number} id
 * @param {string} status
 * @param {number} userId
 * @returns {Promise<Object>}
 */
const updateBookingStatus = async (id, status, userId) => {
  const booking = await Booking.findByPk(id, {
    include: [{ model: Vehicle, as: 'vehicle' }],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Validate status transitions
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['active', 'cancelled'],
    active: ['completed'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from '${booking.status}' to '${status}'`
    );
  }

  // Only provider can confirm/activate, user or provider can cancel
  if (['confirmed', 'active'].includes(status)) {
    if (booking.vehicle.ownerId !== userId) {
      throw ApiError.forbidden('Only the vehicle owner can confirm or activate bookings');
    }
  }

  await booking.update({ status });
  return booking;
};

/**
 * Cancel a booking.
 * @param {number} id
 * @param {number} userId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
const cancelBooking = async (id, userId, reason) => {
  const booking = await Booking.findByPk(id, {
    include: [{ model: Vehicle, as: 'vehicle' }],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only the renter or vehicle owner can cancel
  if (booking.userId !== userId && booking.vehicle.ownerId !== userId) {
    throw ApiError.forbidden('You can only cancel your own bookings');
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw ApiError.badRequest(`Cannot cancel a ${booking.status} booking`);
  }

  await booking.update({
    status: 'cancelled',
    cancellationReason: reason || 'Cancelled by user',
  });

  return booking;
};

/**
 * Calculate rental price (exposed for controller use).
 * @param {Object} vehicle
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
const calculatePrice = (vehicle, startDate, endDate) => {
  return calculateRentalPrice(
    parseFloat(vehicle.pricePerHour),
    parseFloat(vehicle.pricePerDay),
    startDate,
    endDate
  );
};

/**
 * Get booking statistics for a user.
 * @param {number} userId
 * @param {string} role
 * @returns {Promise<Object>}
 */
const getBookingStats = async (userId, role) => {
  let where;

  if (role === 'provider') {
    const vehicles = await Vehicle.findAll({
      where: { ownerId: userId },
      attributes: ['id'],
    });
    const vehicleIds = vehicles.map((v) => v.id);
    where = { vehicleId: { [Op.in]: vehicleIds } };
  } else {
    where = { userId };
  }

  const total = await Booking.count({ where });
  const active = await Booking.count({ where: { ...where, status: 'active' } });
  const completed = await Booking.count({ where: { ...where, status: 'completed' } });
  const cancelled = await Booking.count({ where: { ...where, status: 'cancelled' } });
  const pending = await Booking.count({ where: { ...where, status: 'pending' } });

  // Calculate total revenue (for providers)
  const bookings = await Booking.findAll({
    where: { ...where, status: { [Op.in]: ['completed', 'active'] } },
    attributes: ['totalPrice'],
  });
  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  return { total, active, completed, cancelled, pending, totalRevenue };
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  calculatePrice,
  getBookingStats,
};
