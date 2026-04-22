const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle } = require('../../helpers/testHelpers');
const { Document } = require('../../../src/models');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Document Model', () => {
  let consumer;

  beforeEach(async () => {
    const result = await createTestUser({ role: 'consumer' });
    consumer = result.user;
  });

  const getValidDocument = () => ({
    userId: consumer.id,
    type: 'DL',
    fileUrl: '/uploads/test-dl.jpg',
    status: 'pending',
  });

  describe('creation', () => {
    it('should create a document with valid data', async () => {
      const doc = await Document.create(getValidDocument());
      expect(doc.id).toBeDefined();
      expect(doc.type).toBe('DL');
      expect(doc.status).toBe('pending');
    });

    it('should set default status to pending', async () => {
      const data = getValidDocument();
      delete data.status;
      const doc = await Document.create(data);
      expect(doc.status).toBe('pending');
    });

    it('should accept RC type', async () => {
      const doc = await Document.create({ ...getValidDocument(), type: 'RC' });
      expect(doc.type).toBe('RC');
    });

    it('should accept PUC type', async () => {
      const doc = await Document.create({ ...getValidDocument(), type: 'PUC' });
      expect(doc.type).toBe('PUC');
    });

    it('should store extractedData as JSON', async () => {
      const extractedData = { dlNumber: 'MH12 20190000001', name: 'Test' };
      const doc = await Document.create({ ...getValidDocument(), extractedData });
      expect(doc.extractedData.dlNumber).toBe('MH12 20190000001');
    });

    it('should allow null vehicleId', async () => {
      const doc = await Document.create({ ...getValidDocument(), vehicleId: null });
      expect(doc.vehicleId).toBeNull();
    });
  });

  describe('validation', () => {
    it('should require userId', async () => {
      const data = getValidDocument();
      delete data.userId;
      await expect(Document.create(data)).rejects.toThrow();
    });

    it('should require type', async () => {
      await expect(Document.create({ ...getValidDocument(), type: null }))
        .rejects.toThrow();
    });

    it('should reject invalid type', async () => {
      await expect(Document.create({ ...getValidDocument(), type: 'INVALID' }))
        .rejects.toThrow();
    });

    it('should require fileUrl', async () => {
      await expect(Document.create({ ...getValidDocument(), fileUrl: '' }))
        .rejects.toThrow();
    });
  });

  describe('status flow', () => {
    it('should update to verified status', async () => {
      const doc = await Document.create(getValidDocument());
      await doc.update({ status: 'verified' });
      expect(doc.status).toBe('verified');
    });

    it('should update to rejected status with reason', async () => {
      const doc = await Document.create(getValidDocument());
      await doc.update({ status: 'rejected', rejectionReason: 'Blurry image' });
      expect(doc.status).toBe('rejected');
      expect(doc.rejectionReason).toBe('Blurry image');
    });
  });
});
