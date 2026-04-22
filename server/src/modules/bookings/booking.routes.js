const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createBookingSchema, updateBookingStatusSchema, cancelBookingSchema } = require('./booking.validation');

// All routes require authentication
router.use(authenticate);

router.post('/', authorize('consumer'), validate(createBookingSchema), bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/provider', authorize('provider', 'admin'), bookingController.getProviderBookings);
router.get('/stats', bookingController.getBookingStats);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/status', validate(updateBookingStatusSchema), bookingController.updateBookingStatus);
router.put('/:id/cancel', validate(cancelBookingSchema), bookingController.cancelBooking);

module.exports = router;
