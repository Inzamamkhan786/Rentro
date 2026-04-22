const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Integration: Full User Flows', () => {
  describe('Auth → Profile → Password Change', () => {
    it('should complete full auth flow', async () => {
      // Register
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Integration User', email: 'integ@test.com', password: 'password123', role: 'consumer',
      });
      expect(reg.statusCode).toBe(201);
      const token = reg.body.data.token;

      // Get profile
      const profile = await request(app).get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(profile.statusCode).toBe(200);
      expect(profile.body.data.email).toBe('integ@test.com');

      // Change password
      const changePw = await request(app).put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'password123', newPassword: 'newpass456' });
      expect(changePw.statusCode).toBe(200);

      // Login with new password
      const login = await request(app).post('/api/auth/login')
        .send({ email: 'integ@test.com', password: 'newpass456' });
      expect(login.statusCode).toBe(200);
    });
  });

  describe('Provider: Register → List Vehicle → Get Bookings', () => {
    it('should complete provider flow', async () => {
      // Register as provider
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Provider', email: 'provider@test.com', password: 'password123', role: 'provider',
      });
      const providerToken = reg.body.data.token;

      // Create vehicle
      const vehicle = await request(app).post('/api/vehicles')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ title: 'My Car', type: 'car', brand: 'Honda', model: 'City', year: 2024, pricePerHour: 150, pricePerDay: 2000, location: 'Pune' });
      expect(vehicle.statusCode).toBe(201);

      // Get my listings
      const listings = await request(app).get('/api/vehicles/my/listings')
        .set('Authorization', `Bearer ${providerToken}`);
      expect(listings.statusCode).toBe(200);
      expect(listings.body.data.length).toBe(1);

      // Vehicle should appear in public browse
      const browse = await request(app).get('/api/vehicles');
      expect(browse.statusCode).toBe(200);
      expect(browse.body.data.items.length).toBe(1);
    });
  });

  describe('Consumer: Browse → Book → Cancel', () => {
    it('should complete consumer booking flow', async () => {
      // Setup: provider + vehicle
      const pReg = await request(app).post('/api/auth/register').send({
        name: 'Owner', email: 'owner@test.com', password: 'password123', role: 'provider',
      });
      const pToken = pReg.body.data.token;

      const vRes = await request(app).post('/api/vehicles')
        .set('Authorization', `Bearer ${pToken}`)
        .send({ title: 'Rental Car', type: 'car', brand: 'Maruti', model: 'Swift', year: 2024, pricePerHour: 80, pricePerDay: 1200, location: 'Delhi' });

      // Admin approves vehicle
      const aReg = await request(app).post('/api/auth/register').send({
        name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'consumer',
      });
      // Manually set admin role via DB for this test
      const { User } = require('../../src/models');
      await User.update({ role: 'admin' }, { where: { email: 'admin@test.com' } });
      const aLogin = await request(app).post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
      const aToken = aLogin.body.data.token;

      await request(app).put(`/api/admin/vehicles/${vRes.body.data.id}/approve`)
        .set('Authorization', `Bearer ${aToken}`);

      // Consumer registers
      const cReg = await request(app).post('/api/auth/register').send({
        name: 'Renter', email: 'renter@test.com', password: 'password123', role: 'consumer',
      });
      const cToken = cReg.body.data.token;

      // Browse vehicles
      const browse = await request(app).get('/api/vehicles');
      expect(browse.body.data.items.length).toBe(1);
      const vehicleId = browse.body.data.items[0].id;

      // Book vehicle
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 172800000).toISOString();
      const bookRes = await request(app).post('/api/bookings')
        .set('Authorization', `Bearer ${cToken}`)
        .send({ vehicleId, startDate: start, endDate: end });
      expect(bookRes.statusCode).toBe(201);
      const bookingId = bookRes.body.data.id;

      // Get my bookings
      const myBookings = await request(app).get('/api/bookings/my')
        .set('Authorization', `Bearer ${cToken}`);
      expect(myBookings.body.data.items.length).toBe(1);

      // Cancel booking
      const cancel = await request(app).put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${cToken}`)
        .send({ reason: 'Changed plans' });
      expect(cancel.statusCode).toBe(200);
    });
  });

  describe('Document Verification Flow', () => {
    it('should complete DL verification flow', async () => {
      // Consumer uploads DL
      const cReg = await request(app).post('/api/auth/register').send({
        name: 'Verifier', email: 'verify@test.com', password: 'password123',
      });
      const cToken = cReg.body.data.token;

      const upload = await request(app).post('/api/documents')
        .set('Authorization', `Bearer ${cToken}`)
        .send({ type: 'DL', fileUrl: '/uploads/dl.jpg' });
      expect(upload.statusCode).toBe(201);
      const docId = upload.body.data.id;

      // Admin verifies
      const { User } = require('../../src/models');
      const aReg = await request(app).post('/api/auth/register').send({
        name: 'Admin2', email: 'admin2@test.com', password: 'password123',
      });
      await User.update({ role: 'admin' }, { where: { email: 'admin2@test.com' } });
      const aLogin = await request(app).post('/api/auth/login')
        .send({ email: 'admin2@test.com', password: 'password123' });
      const aToken = aLogin.body.data.token;

      // Check pending
      const pending = await request(app).get('/api/documents/pending')
        .set('Authorization', `Bearer ${aToken}`);
      expect(pending.body.data.items.length).toBe(1);

      // Verify document
      const verify = await request(app).put(`/api/documents/${docId}/verify`)
        .set('Authorization', `Bearer ${aToken}`)
        .send({ status: 'verified' });
      expect(verify.statusCode).toBe(200);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('running');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
});
