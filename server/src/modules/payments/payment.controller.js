const paymentService = require('./payment.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/payments/create-intent
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(req.body.bookingId, req.userId);
  res.status(200).json(ApiResponse.ok(result));
});

/**
 * POST /api/payments/confirm
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPayment(req.body.paymentIntentId, req.userId);
  res.status(200).json(ApiResponse.ok(result, 'Payment confirmed'));
});

/**
 * GET /api/payments/status/:paymentId
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentStatus(req.params.paymentId);
  res.status(200).json(ApiResponse.ok(result));
});

/**
 * POST /api/payments/refund
 */
const processRefund = asyncHandler(async (req, res) => {
  const result = await paymentService.processRefund(req.body.bookingId, req.userId, req.body.amount);
  res.status(200).json(ApiResponse.ok(result, 'Refund processed'));
});

/**
 * GET /api/payments/history
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentHistory(req.userId, req.query);
  res.status(200).json(ApiResponse.paginated(result.payments, result.page, result.limit, result.total));
});

/**
 * GET /api/payments/invoice/:bookingId
 */
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await paymentService.generateInvoice(parseInt(req.params.bookingId, 10));
  res.status(200).json(ApiResponse.ok(invoice));
});

/**
 * GET /api/payments/earnings
 */
const getEarnings = asyncHandler(async (req, res) => {
  const earnings = await paymentService.getEarnings(req.userId, {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });
  res.status(200).json(ApiResponse.ok(earnings));
});

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory,
  getInvoice,
  getEarnings,
};
