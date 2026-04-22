const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createPaymentSchema, confirmPaymentSchema, refundSchema } = require('./payment.validation');

router.use(authenticate);

router.post('/create-intent', validate(createPaymentSchema), paymentController.createPaymentIntent);
router.post('/confirm', validate(confirmPaymentSchema), paymentController.confirmPayment);
router.get('/status/:paymentId', paymentController.getPaymentStatus);
router.post('/refund', authorize('admin'), validate(refundSchema), paymentController.processRefund);
router.get('/history', paymentController.getPaymentHistory);
router.get('/invoice/:bookingId', paymentController.getInvoice);
router.get('/earnings', authorize('provider', 'admin'), paymentController.getEarnings);

module.exports = router;
