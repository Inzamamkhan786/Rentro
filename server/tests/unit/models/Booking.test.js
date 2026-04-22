const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle } = require('../../helpers/testHelpers');
const { Booking } = require('../../../src/models');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Booking Model', () => {
  let consumer, provider, vehicle;

  beforeEach(async () => {
    const consumerResult = await createTestUser({ role: 'consumer' });
    consumer = consumerResult.user;
    const providerResult = await createTestUser({ role: 'provider' });
    provider = providerResult.user;
    vehicle = await createTestVehicle(provider.id);
  });

  const getValidBooking = () => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date();
    end.setDate(end.getDate() + 3);
    return {
      userId: consumer.id,
      vehicleId: vehicle.id,
      startDate: start,
      endDate: end,
      totalPrice: 3000,
      status: 'pending',
    };
  };

  describe('creation', () => {
    it('should create a booking with valid data', async () => {
      const booking = await Booking.create(getValidBooking());
      expect(booking.id).toBeDefined();
      expect(booking.status).toBe('pending');
      expect(parseFloat(booking.totalPrice)).toBe(3000);
    });

    it('should set default status to pending', async () => {
      const data = getValidBooking();
      delete data.status;
      const booking = await Booking.create(data);
      expect(booking.status).toBe('pending');
    });

    it('should set default paymentStatus to pending', async () => {
      const booking = await Booking.create(getValidBooking());
      expect(booking.paymentStatus).toBe('pending');
    });
  });

  describe('validation', () => {
    it('should require userId', async () => {
      const data = getValidBooking();
      delete data.userId;
      await expect(Booking.create(data)).rejects.toThrow();
    });

    it('should require vehicleId', async () => {
      const data = getValidBooking();
      delete data.vehicleId;
      await expect(Booking.create(data)).rejects.toThrow();
    });

    it('should require startDate', async () => {
      const data = getValidBooking();
      data.startDate = null;
      await expect(Booking.create(data)).rejects.toThrow();
    });

    it('should require endDate', async () => {
      const data = getValidBooking();
      data.endDate = null;
      await expect(Booking.create(data)).rejects.toThrow();
    });

    it('should validate endDate is after startDate', async () => {
      const data = getValidBooking();
      data.endDate = new Date(data.startDate.getTime() - 86400000);
      await expect(Booking.create(data)).rejects.toThrow();
    });
  });

  describe('virtual getters', () => {
    it('should calculate durationHours', async () => {
      const start = new Date('2024-01-01T10:00:00Z');
      const end = new Date('2024-01-02T10:00:00Z');
      const booking = await Booking.create({
        ...getValidBooking(),
        startDate: start,
        endDate: end,
      });
      expect(booking.durationHours).toBe(24);
    });

    it('should calculate durationDays', async () => {
      const start = new Date('2024-01-01T10:00:00Z');
      const end = new Date('2024-01-03T10:00:00Z');
      const booking = await Booking.create({
        ...getValidBooking(),
        startDate: start,
        endDate: end,
      });
      expect(booking.durationDays).toBe(2);
    });
  });

  describe('status values', () => {
    it('should accept confirmed status', async () => {
      const booking = await Booking.create({ ...getValidBooking(), status: 'confirmed' });
      expect(booking.status).toBe('confirmed');
    });

    it('should accept active status', async () => {
      const booking = await Booking.create({ ...getValidBooking(), status: 'active' });
      expect(booking.status).toBe('active');
    });

    it('should accept completed status', async () => {
      const booking = await Booking.create({ ...getValidBooking(), status: 'completed' });
      expect(booking.status).toBe('completed');
    });

    it('should accept cancelled status', async () => {
      const booking = await Booking.create({ ...getValidBooking(), status: 'cancelled' });
      expect(booking.status).toBe('cancelled');
    });
  });
});
