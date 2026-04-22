const request = require('supertest');
const app = require('../../../src/app');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestDocument } = require('../../helpers/testHelpers');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Document Controller', () => {
  let consumerToken, adminToken, consumer, admin;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user; consumerToken = cRes.token;
    const aRes = await createTestUser({ role: 'admin' });
    admin = aRes.user; adminToken = aRes.token;
  });

  describe('POST /api/documents', () => {
    it('should upload a document', async () => {
      const res = await request(app).post('/api/documents')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ type: 'DL', fileUrl: '/uploads/dl.jpg' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.type).toBe('DL');
    });

    it('should reject invalid type', async () => {
      const res = await request(app).post('/api/documents')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ type: 'INVALID', fileUrl: '/uploads/doc.jpg' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/documents/my', () => {
    it('should return user documents', async () => {
      await createTestDocument(consumer.id);
      const res = await request(app).get('/api/documents/my')
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PUT /api/documents/:id/verify', () => {
    it('should verify document (admin)', async () => {
      const doc = await createTestDocument(consumer.id);
      const res = await request(app).put(`/api/documents/${doc.id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'verified' });
      expect(res.statusCode).toBe(200);
    });

    it('should reject non-admin verification', async () => {
      const doc = await createTestDocument(consumer.id);
      const res = await request(app).put(`/api/documents/${doc.id}/verify`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ status: 'verified' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/documents/pending', () => {
    it('should return pending documents (admin)', async () => {
      await createTestDocument(consumer.id);
      const res = await request(app).get('/api/documents/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/documents/:id/expiry', () => {
    it('should check document expiry', async () => {
      const doc = await createTestDocument(consumer.id, { expiryDate: new Date('2020-01-01') });
      const res = await request(app).get(`/api/documents/${doc.id}/expiry`)
        .set('Authorization', `Bearer ${consumerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.expired).toBe(true);
    });
  });
});
