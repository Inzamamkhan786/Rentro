const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestBooking } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Booking Controller', () => {
  let consumerToken, providerToken, consumer, provider, vehicle;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user; consumerToken = cRes.token;
    const pRes = await createTestUser({ role: 'provider' });
    provider = pRes.user; providerToken = pRes.token;
    vehicle = await createTestVehicle(provider.id);
  });

  describe('POST /api/bookings', () => {
    it('should create a booking (consumer)', async () => {
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 172800000).toISOString();
      const res = await request(app).post('/api/bookings')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ vehicleId: vehicle.id, startDate: start, endDate: end });
      expect(res.statusCode).toBe(201);
    });

    it('should reject provider creating booking', async () => {
      const res = await request(app).post('/api/bookings')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ vehicleId: vehicle.id, startDate: new Date().toISOString(), endDate: new Date().toISOString() });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/bookings/my', () => {
    it('should return user bookings', async () => {
      await createTestBooking(consumer.id, vehicle.id);
      const res = await request(app).get('/api/bookings/my')
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return booking details', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const res = await request(app).get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const booking = await createTestBooking(consumer.id, vehicle.id);
      const res = await request(app).put(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ reason: 'Changed plans' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('should return stats', async () => {
      await createTestBooking(consumer.id, vehicle.id);
      const res = await request(app).get('/api/bookings/stats')
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.total).toBe(1);
    });
  });
});
