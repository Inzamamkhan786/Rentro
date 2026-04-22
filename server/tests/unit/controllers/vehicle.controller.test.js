const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Vehicle Controller', () => {
  let providerToken, consumerToken, provider;

  beforeEach(async () => {
    const pRes = await createTestUser({ role: 'provider', name: 'Provider' });
    provider = pRes.user;
    providerToken = pRes.token;
    const cRes = await createTestUser({ role: 'consumer', name: 'Consumer' });
    consumerToken = cRes.token;
  });

  describe('POST /api/vehicles', () => {
    it('should create a vehicle (provider)', async () => {
      const res = await request(app).post('/api/vehicles')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ title: 'Toyota', type: 'car', brand: 'Toyota', model: 'Camry', year: 2024, pricePerHour: 100, pricePerDay: 1500, location: 'Mumbai' });
      expect(res.statusCode).toBe(201);
    });

    it('should reject consumer creating vehicle', async () => {
      const res = await request(app).post('/api/vehicles')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ title: 'Toyota', type: 'car', brand: 'Toyota', model: 'Camry', year: 2024, pricePerHour: 100, pricePerDay: 1500, location: 'Mumbai' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return vehicles (public)', async () => {
      await createTestVehicle(provider.id);
      const res = await request(app).get('/api/vehicles');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });

    it('should filter by type', async () => {
      await createTestVehicle(provider.id, { type: 'car' });
      await createTestVehicle(provider.id, { type: 'bike' });
      const res = await request(app).get('/api/vehicles?type=bike');
      expect(res.body.data.items.length).toBe(1);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return single vehicle', async () => {
      const vehicle = await createTestVehicle(provider.id);
      const res = await request(app).get(`/api/vehicles/${vehicle.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(vehicle.id);
    });

    it('should return 404 for non-existent', async () => {
      const res = await request(app).get('/api/vehicles/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update own vehicle', async () => {
      const vehicle = await createTestVehicle(provider.id);
      const res = await request(app).put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ title: 'Updated Title' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should delete own vehicle', async () => {
      const vehicle = await createTestVehicle(provider.id);
      const res = await request(app).delete(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', `Bearer ${providerToken}`);
      expect(res.statusCode).toBe(200);
    });
  });
});
