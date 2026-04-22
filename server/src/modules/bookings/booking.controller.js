const bookingService = require('./booking.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/bookings
 */
const createBooking = asyncHandler(async (req, res) => {
  const { vehicleId, startDate, endDate } = req.body;
  const booking = await bookingService.createBooking(req.userId, vehicleId, { startDate, endDate });
  res.status(201).json(ApiResponse.created(booking));
});

/**
 * GET /api/bookings/:id
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(booking));
});

/**
 * GET /api/bookings/my
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getUserBookings(req.userId, req.query);
  res.status(200).json(ApiResponse.paginated(result.bookings, result.page, result.limit, result.total));
});

/**
 * GET /api/bookings/provider
 */
const getProviderBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getProviderBookings(req.userId, req.query);
  res.status(200).json(ApiResponse.paginated(result.bookings, result.page, result.limit, result.total));
});

/**
 * PUT /api/bookings/:id/status
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    parseInt(req.params.id, 10),
    req.body.status,
    req.userId
  );
  res.status(200).json(ApiResponse.ok(booking, 'Booking status updated'));
});

/**
 * PUT /api/bookings/:id/cancel
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    parseInt(req.params.id, 10),
    req.userId,
    req.body.reason
  );
  res.status(200).json(ApiResponse.ok(booking, 'Booking cancelled'));
});

/**
 * GET /api/bookings/stats
 */
const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await bookingService.getBookingStats(req.userId, req.user.role);
  res.status(200).json(ApiResponse.ok(stats));
});

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
};
