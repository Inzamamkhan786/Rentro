const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'john@test.com', password: 'password123', role: 'consumer',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'John' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'invalid', password: 'password123',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'john@test.com', password: '12345',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'John', email: 'dup@test.com', password: 'password123',
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane', email: 'dup@test.com', password: 'password456',
      });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'John', email: 'login@test.com', password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com', password: 'password123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com', password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nope@test.com', password: 'password123',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile for authenticated user', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'profile@test.com', password: 'password123',
      });
      const token = reg.body.data.token;

      const res = await request(app).get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('John');
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'cp@test.com', password: 'password123',
      });
      const token = reg.body.data.token;

      const res = await request(app).put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'password123', newPassword: 'newpass456' });
      expect(res.statusCode).toBe(200);

      // Verify new password works
      const login = await request(app).post('/api/auth/login')
        .send({ email: 'cp@test.com', password: 'newpass456' });
      expect(login.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'John', email: 'logout@test.com', password: 'password123',
      });
      const res = await request(app).post('/api/auth/logout')
        .set('Authorization', `Bearer ${reg.body.data.token}`);
      expect(res.statusCode).toBe(200);
    });
  });
});
