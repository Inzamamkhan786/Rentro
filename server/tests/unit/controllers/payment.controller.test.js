const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestBooking } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Payment Controller', () => {
  let consumerToken, consumer, provider, vehicle, booking;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user; consumerToken = cRes.token;
    const pRes = await createTestUser({ role: 'provider' });
    provider = pRes.user;
    vehicle = await createTestVehicle(provider.id);
    booking = await createTestBooking(consumer.id, vehicle.id);
  });

  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent', async () => {
      const res = await request(app).post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ bookingId: booking.id });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.paymentIntentId).toBeDefined();
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return payment history', async () => {
      const res = await request(app).get('/api/payments/history')
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/payments/invoice/:bookingId', () => {
    it('should generate invoice', async () => {
      const res = await request(app).get(`/api/payments/invoice/${booking.id}`)
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.invoiceNumber).toBeDefined();
    });
  });
});
