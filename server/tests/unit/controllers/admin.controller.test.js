const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestDocument } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Admin Controller', () => {
  let adminToken, admin;

  beforeEach(async () => {
    const aRes = await createTestUser({ role: 'admin' });
    admin = aRes.user; adminToken = aRes.token;
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard stats', async () => {
      const res = await request(app).get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalUsers).toBeDefined();
    });

    it('should reject non-admin', async () => {
      const { token } = await createTestUser({ role: 'consumer' });
      const res = await request(app).get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/admin/users/:id/ban', () => {
    it('should ban a user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      const res = await request(app).put(`/api/admin/users/${user.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Violation' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.banned).toBe(true);
    });
  });

  describe('PUT /api/admin/users/:id/unban', () => {
    it('should unban a user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await request(app).put(`/api/admin/users/${user.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });
      const res = await request(app).put(`/api/admin/users/${user.id}/unban`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.banned).toBe(false);
    });
  });

  describe('PUT /api/admin/vehicles/:id/approve', () => {
    it('should approve a vehicle', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      const vehicle = await createTestVehicle(p.id, { verified: false });
      const res = await request(app).put(`/api/admin/vehicles/${vehicle.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/admin/verifications', () => {
    it('should return pending verifications', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await createTestDocument(user.id);
      const res = await request(app).get('/api/admin/verifications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/admin/revenue', () => {
    it('should return revenue report', async () => {
      const res = await request(app).get('/api/admin/revenue')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalRevenue).toBeDefined();
    });
  });
});
