const { Op } = require('sequelize');
const { Booking, Vehicle } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination } = require('../../utils/helpers');

// Mock Stripe for testing - in production use real Stripe SDK
const stripe = process.env.NODE_ENV === 'test'
  ? {
    paymentIntents: {
      create: async (data) => ({
        id: 'pi_test_' + Date.now(),
        amount: data.amount,
        currency: data.currency,
        status: 'requires_confirmation',
        client_secret: 'cs_test_' + Date.now(),
      }),
      confirm: async (id) => ({
        id,
        status: 'succeeded',
      }),
      retrieve: async (id) => ({
        id,
        status: 'succeeded',
        amount: 5000,
      }),
    },
    refunds: {
      create: async (data) => ({
        id: 'rf_test_' + Date.now(),
        payment_intent: data.payment_intent,
        amount: data.amount,
        status: 'succeeded',
      }),
    },
  }
  : require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Create a payment intent for a booking.
 * @param {number} bookingId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
const createPaymentIntent = async (bookingId, userId) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.userId !== userId) {
    throw ApiError.forbidden('You can only pay for your own bookings');
  }

  if (booking.paymentStatus === 'paid') {
    throw ApiError.badRequest('Booking is already paid');
  }

  const amountInPaise = Math.round(parseFloat(booking.totalPrice) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaise,
    currency: 'inr',
    metadata: {
      bookingId: booking.id.toString(),
      userId: userId.toString(),
    },
  });

  await booking.update({
    paymentId: paymentIntent.id,
  });

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount: amountInPaise,
    currency: 'inr',
  };
};

/**
 * Confirm a payment.
 * @param {string} paymentIntentId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
const confirmPayment = async (paymentIntentId, userId) => {
  const booking = await Booking.findOne({
    where: { paymentId: paymentIntentId },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found for this payment');
  }

  if (booking.userId !== userId) {
    throw ApiError.forbidden('You can only confirm your own payments');
  }

  const paymentResult = await stripe.paymentIntents.confirm(paymentIntentId);

  if (paymentResult.status === 'succeeded') {
    await booking.update({
      paymentStatus: 'paid',
      status: 'confirmed',
    });
  }

  return {
    paymentId: paymentIntentId,
    status: paymentResult.status,
    booking: booking,
  };
};

/**
 * Get payment status.
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
const getPaymentStatus = async (paymentId) => {
  if (!paymentId) {
    throw ApiError.badRequest('Payment ID is required');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

  return {
    paymentId: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
  };
};

/**
 * Process a refund.
 * @param {number} bookingId
 * @param {number} adminId
 * @param {number} amount - Optional partial refund amount
 * @returns {Promise<Object>}
 */
const processRefund = async (bookingId, adminId, amount) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (!booking.paymentId) {
    throw ApiError.badRequest('No payment found for this booking');
  }

  if (booking.paymentStatus !== 'paid') {
    throw ApiError.badRequest('Booking payment is not in paid status');
  }

  const refundAmount = amount
    ? Math.round(amount * 100)
    : Math.round(parseFloat(booking.totalPrice) * 100);

  const refund = await stripe.refunds.create({
    payment_intent: booking.paymentId,
    amount: refundAmount,
  });

  await booking.update({
    paymentStatus: 'refunded',
    status: 'cancelled',
  });

  return {
    refundId: refund.id,
    amount: refundAmount,
    status: refund.status,
  };
};

/**
 * Get payment history for a user.
 * @param {number} userId
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getPaymentHistory = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Booking.findAndCountAll({
    where: {
      userId,
      paymentId: { [Op.ne]: null },
    },
    attributes: ['id', 'totalPrice', 'paymentId', 'paymentStatus', 'createdAt'],
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'title', 'type'] },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { payments: rows, total: count, page, limit };
};

/**
 * Generate an invoice for a booking.
 * @param {number} bookingId
 * @returns {Promise<Object>}
 */
const generateInvoice = async (bookingId) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Vehicle, as: 'vehicle' },
    ],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  const invoice = {
    invoiceNumber: `INV-${Date.now()}-${booking.id}`,
    bookingId: booking.id,
    date: new Date().toISOString(),
    vehicle: {
      title: booking.vehicle.title,
      type: booking.vehicle.type,
      brand: booking.vehicle.brand,
    },
    period: {
      startDate: booking.startDate,
      endDate: booking.endDate,
      durationHours: booking.durationHours,
    },
    amount: parseFloat(booking.totalPrice),
    paymentStatus: booking.paymentStatus,
    paymentId: booking.paymentId,
  };

  return invoice;
};

/**
 * Get earnings for a provider.
 * @param {number} providerId
 * @param {Object} dateRange - { startDate, endDate }
 * @returns {Promise<Object>}
 */
const getEarnings = async (providerId, dateRange) => {
  const vehicles = await Vehicle.findAll({
    where: { ownerId: providerId },
    attributes: ['id'],
  });
  const vehicleIds = vehicles.map((v) => v.id);

  if (vehicleIds.length === 0) {
    return { totalEarnings: 0, bookingCount: 0, earnings: [] };
  }

  const where = {
    vehicleId: { [Op.in]: vehicleIds },
    paymentStatus: 'paid',
    status: { [Op.in]: ['completed', 'active', 'confirmed'] },
  };

  if (dateRange?.startDate) {
    where.createdAt = { ...where.createdAt, [Op.gte]: new Date(dateRange.startDate) };
  }
  if (dateRange?.endDate) {
    where.createdAt = { ...where.createdAt, [Op.lte]: new Date(dateRange.endDate) };
  }

  const bookings = await Booking.findAll({
    where,
    include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'title'] }],
    order: [['created_at', 'DESC']],
  });

  const totalEarnings = bookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  return {
    totalEarnings,
    bookingCount: bookings.length,
    earnings: bookings.map((b) => ({
      bookingId: b.id,
      vehicle: b.vehicle.title,
      amount: parseFloat(b.totalPrice),
      date: b.createdAt,
    })),
  };
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory,
  generateInvoice,
  getEarnings,
};
