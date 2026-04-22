const { Op } = require('sequelize');
const { User, Vehicle, Booking, Document } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination } = require('../../utils/helpers');

/**
 * Get platform-wide dashboard statistics.
 * @returns {Promise<Object>}
 */
const getDashboardStats = async () => {
  const totalUsers = await User.count();
  const totalVehicles = await Vehicle.count();
  const totalBookings = await Booking.count();
  const activeBookings = await Booking.count({ where: { status: 'active' } });
  const pendingVerifications = await Document.count({ where: { status: 'pending' } });
  const totalRevenue = await Booking.sum('total_price', {
    where: { paymentStatus: 'paid' },
  });

  return {
    totalUsers,
    totalVehicles,
    totalBookings,
    activeBookings,
    pendingVerifications,
    totalRevenue: totalRevenue || 0,
  };
};

/**
 * Get all users with admin filters.
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getAllUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.role) where.role = query.role;
  if (query.verified !== undefined) where.verified = query.verified === 'true';
  if (query.banned !== undefined) where.banned = query.banned === 'true';
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { email: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { users: rows, total: count, page, limit };
};

/**
 * Ban a user.
 * @param {number} userId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
const banUser = async (userId, reason) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.forbidden('Cannot ban an admin');
  }

  if (user.banned) {
    throw ApiError.badRequest('User is already banned');
  }

  await user.update({
    banned: true,
    banReason: reason || 'Banned by admin',
  });

  return user.toSafeJSON();
};

/**
 * Unban a user.
 * @param {number} userId
 * @returns {Promise<Object>}
 */
const unbanUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.banned) {
    throw ApiError.badRequest('User is not banned');
  }

  await user.update({
    banned: false,
    banReason: null,
  });

  return user.toSafeJSON();
};

/**
 * Approve a vehicle listing.
 * @param {number} vehicleId
 * @returns {Promise<Object>}
 */
const approveVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  if (vehicle.verified) {
    throw ApiError.badRequest('Vehicle is already verified');
  }

  await vehicle.update({ verified: true });
  return vehicle;
};

/**
 * Remove a vehicle listing.
 * @param {number} vehicleId
 * @param {string} reason
 * @returns {Promise<void>}
 */
const removeVehicle = async (vehicleId, reason) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  // Cancel all active bookings for this vehicle
  await Booking.update(
    { status: 'cancelled', cancellationReason: reason || 'Vehicle removed by admin' },
    {
      where: {
        vehicleId,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
    }
  );

  await vehicle.destroy();
};

/**
 * Get pending verification documents.
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getPendingVerifications = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Document.findAndCountAll({
    where: { status: 'pending' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
    ],
    limit,
    offset,
    order: [['created_at', 'ASC']],
  });

  return { documents: rows, total: count, page, limit };
};

/**
 * Get revenue report for a date range.
 * @param {Object} dateRange - { startDate, endDate }
 * @returns {Promise<Object>}
 */
const getRevenueReport = async (dateRange) => {
  const where = { paymentStatus: 'paid' };

  if (dateRange?.startDate) {
    where.createdAt = { ...where.createdAt, [Op.gte]: new Date(dateRange.startDate) };
  }
  if (dateRange?.endDate) {
    where.createdAt = { ...where.createdAt, [Op.lte]: new Date(dateRange.endDate) };
  }

  const bookings = await Booking.findAll({
    where,
    attributes: ['id', 'totalPrice', 'createdAt', 'status'],
    order: [['created_at', 'DESC']],
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  return {
    totalRevenue,
    totalTransactions: bookings.length,
    averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    transactions: bookings,
  };
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  banUser,
  unbanUser,
  approveVehicle,
  removeVehicle,
  getPendingVerifications,
  getRevenueReport,
};
