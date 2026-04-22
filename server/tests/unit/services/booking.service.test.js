const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestBooking } = require('../../helpers/testHelpers');
const bookingService = require('../../../src/modules/bookings/booking.service');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Booking Service', () => {
  let consumer, provider, vehicle;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user;
    const pRes = await createTestUser({ role: 'provider' });
    provider = pRes.user;
    vehicle = await createTestVehicle(provider.id);
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const start = new Date(Date.now() + 86400000);
      const end = new Date(Date.now() + 172800000);
      const booking = await bookingService.createBooking(consumer.id, vehicle.id, { startDate: start, endDate: end });
      expect(booking.id).toBeDefined();
      expect(booking.status).toBe('pending');
    });

    it('should throw for non-existent vehicle', async () => {
      await expect(bookingService.createBooking(consumer.id, 99999, {
        startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
      })).rejects.toThrow('Vehicle not found');
    });

    it('should prevent booking own vehicle', async () => {
      await expect(bookingService.createBooking(provider.id, vehicle.id, {
        startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
      })).rejects.toThrow('You cannot book your own vehicle');
    });

    it('should prevent booking unavailable vehicle', async () => {
      await vehicle.update({ availability: false });
      await expect(bookingService.createBooking(consumer.id, vehicle.id, {
        startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
      })).rejects.toThrow('Vehicle is not available');
    });

    it('should prevent booking unverified vehicle', async () => {
      await vehicle.update({ verified: false });
      await expect(bookingService.createBooking(consumer.id, vehicle.id, {
        startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
      })).rejects.toThrow('Vehicle is not yet verified');
    });
  });

  describe('getBookingById', () => {
    it('should return booking with includes', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const found = await bookingService.getBookingById(booking.id);
      expect(found.id).toBe(booking.id);
      expect(found.user).toBeDefined();
      expect(found.vehicle).toBeDefined();
    });

    it('should throw for non-existent booking', async () => {
      await expect(bookingService.getBookingById(99999)).rejects.toThrow('Booking not found');
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings', async () => {
      await createTestBooking(consumer.id, vehicle.id);
      await createTestBooking(consumer.id, vehicle.id, { startDate: new Date(Date.now() + 500000000), endDate: new Date(Date.now() + 600000000) });
      const result = await bookingService.getUserBookings(consumer.id, {});
      expect(result.bookings.length).toBe(2);
    });

    it('should filter by status', async () => {
      await createTestBooking(consumer.id, vehicle.id, { status: 'pending' });
      await createTestBooking(consumer.id, vehicle.id, { status: 'completed', startDate: new Date(Date.now() + 500000000), endDate: new Date(Date.now() + 600000000) });
      const result = await bookingService.getUserBookings(consumer.id, { status: 'completed' });
      expect(result.bookings.length).toBe(1);
    });
  });

  describe('updateBookingStatus', () => {
    it('should confirm a pending booking (by owner)', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const updated = await bookingService.updateBookingStatus(booking.id, 'confirmed', provider.id);
      expect(updated.status).toBe('confirmed');
    });

    it('should reject invalid status transition', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id, { status: 'completed' });
      await expect(bookingService.updateBookingStatus(booking.id, 'active', provider.id))
        .rejects.toThrow('Cannot transition');
    });

    it('should prevent non-owner from confirming', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      await expect(bookingService.updateBookingStatus(booking.id, 'confirmed', consumer.id))
        .rejects.toThrow('Only the vehicle owner');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a pending booking', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const cancelled = await bookingService.cancelBooking(booking.id, consumer.id, 'Changed plans');
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellationReason).toBe('Changed plans');
    });

    it('should prevent cancelling completed booking', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id, { status: 'completed' });
      await expect(bookingService.cancelBooking(booking.id, consumer.id))
        .rejects.toThrow('Cannot cancel a completed booking');
    });

    it('should prevent non-party from cancelling', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const { user: other } = await createTestUser();
      await expect(bookingService.cancelBooking(booking.id, other.id))
        .rejects.toThrow('You can only cancel your own bookings');
    });
  });

  describe('calculatePrice', () => {
    it('should calculate hourly price', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-01T15:00:00Z';
      const price = bookingService.calculatePrice({ pricePerHour: 100, pricePerDay: 1500 }, start, end);
      expect(price).toBe(500);
    });

    it('should calculate daily price', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-03T10:00:00Z';
      const price = bookingService.calculatePrice({ pricePerHour: 100, pricePerDay: 1500 }, start, end);
      expect(price).toBe(3000);
    });
  });

  describe('getBookingStats', () => {
    it('should return consumer stats', async () => {
      await createTestBooking(consumer.id, vehicle.id, { status: 'completed', totalPrice: 1500 });
      await createTestBooking(consumer.id, vehicle.id, { status: 'pending', startDate: new Date(Date.now() + 500000000), endDate: new Date(Date.now() + 600000000) });
      const stats = await bookingService.getBookingStats(consumer.id, 'consumer');
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });
});
