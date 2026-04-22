const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestDocument } = require('../../helpers/testHelpers');
const documentService = require('../../../src/modules/documents/document.service');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Document Service', () => {
  let consumer, admin;

  beforeEach(async () => {
    const cRes = await createTestUser({ role: 'consumer' });
    consumer = cRes.user;
    const aRes = await createTestUser({ role: 'admin' });
    admin = aRes.user;
  });

  describe('uploadDocument', () => {
    it('should upload a DL document', async () => {
      const doc = await documentService.uploadDocument(consumer.id, {
        type: 'DL', fileUrl: '/uploads/dl.jpg',
      });
      expect(doc.id).toBeDefined();
      expect(doc.type).toBe('DL');
      expect(doc.status).toBe('pending');
      expect(doc.extractedData).toBeDefined();
    });

    it('should throw for non-existent user', async () => {
      await expect(documentService.uploadDocument(99999, {
        type: 'DL', fileUrl: '/uploads/dl.jpg',
      })).rejects.toThrow('User not found');
    });

    it('should upload RC with vehicleId', async () => {
      const { user: provider } = await createTestUser({ role: 'provider' });
      const vehicle = await createTestVehicle(provider.id);
      const doc = await documentService.uploadDocument(provider.id, {
        type: 'RC', fileUrl: '/uploads/rc.jpg', vehicleId: vehicle.id,
      });
      expect(doc.vehicleId).toBe(vehicle.id);
    });

    it('should prevent upload for vehicle not owned', async () => {
      const { user: provider } = await createTestUser({ role: 'provider' });
      const vehicle = await createTestVehicle(provider.id);
      await expect(documentService.uploadDocument(consumer.id, {
        type: 'RC', fileUrl: '/uploads/rc.jpg', vehicleId: vehicle.id,
      })).rejects.toThrow('Vehicle does not belong to you');
    });
  });

  describe('getDocumentById', () => {
    it('should return document with user info', async () => {
      const doc = await createTestDocument(consumer.id);
      const found = await documentService.getDocumentById(doc.id);
      expect(found.id).toBe(doc.id);
      expect(found.user).toBeDefined();
    });

    it('should throw for non-existent document', async () => {
      await expect(documentService.getDocumentById(99999)).rejects.toThrow('Document not found');
    });
  });

  describe('getUserDocuments', () => {
    it('should return user documents', async () => {
      await createTestDocument(consumer.id, { type: 'DL' });
      const docs = await documentService.getUserDocuments(consumer.id);
      expect(docs.length).toBe(1);
    });
  });

  describe('verifyDocument', () => {
    it('should verify a pending document', async () => {
      const doc = await createTestDocument(consumer.id);
      const verified = await documentService.verifyDocument(doc.id, admin.id, 'verified');
      expect(verified.status).toBe('verified');
      expect(verified.verifiedById).toBe(admin.id);
    });

    it('should reject a document with reason', async () => {
      const doc = await createTestDocument(consumer.id);
      const rejected = await documentService.verifyDocument(doc.id, admin.id, 'rejected', 'Blurry image');
      expect(rejected.status).toBe('rejected');
      expect(rejected.rejectionReason).toBe('Blurry image');
    });

    it('should require reason for rejection', async () => {
      const doc = await createTestDocument(consumer.id);
      await expect(documentService.verifyDocument(doc.id, admin.id, 'rejected'))
        .rejects.toThrow('Rejection reason is required');
    });

    it('should throw for already verified document', async () => {
      const doc = await createTestDocument(consumer.id, { status: 'verified' });
      await expect(documentService.verifyDocument(doc.id, admin.id, 'verified'))
        .rejects.toThrow('Document is already verified');
    });

    it('should throw for non-existent document', async () => {
      await expect(documentService.verifyDocument(99999, admin.id, 'verified'))
        .rejects.toThrow('Document not found');
    });
  });

  describe('validateDocumentData', () => {
    it('should validate valid DL data', () => {
      const result = documentService.validateDocumentData('DL', {
        dlNumber: 'MH12 20190000001', name: 'Test', expiryDate: '2039-01-01', confidence: 0.9,
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate RC data', () => {
      const result = documentService.validateDocumentData('RC', {
        registrationNumber: 'MH12AB1234', ownerName: 'Test', expiryDate: '2035-01-01',
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for unknown type', () => {
      const result = documentService.validateDocumentData('UNKNOWN', {});
      expect(result.isValid).toBe(false);
    });
  });

  describe('checkDocumentExpiry', () => {
    it('should return expired for past date', async () => {
      const doc = await createTestDocument(consumer.id, { expiryDate: new Date('2020-01-01') });
      const result = await documentService.checkDocumentExpiry(doc.id);
      expect(result.expired).toBe(true);
    });

    it('should return not expired for future date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);
      const doc = await createTestDocument(consumer.id, { expiryDate: futureDate });
      const result = await documentService.checkDocumentExpiry(doc.id);
      expect(result.expired).toBe(false);
    });

    it('should handle no expiry date', async () => {
      const doc = await createTestDocument(consumer.id, { expiryDate: null });
      const result = await documentService.checkDocumentExpiry(doc.id);
      expect(result.expired).toBe(false);
    });
  });

  describe('getPendingDocuments', () => {
    it('should return pending documents', async () => {
      await createTestDocument(consumer.id, { status: 'pending' });
      await createTestDocument(consumer.id, { status: 'verified', type: 'RC', fileUrl: '/rc.jpg' });
      const result = await documentService.getPendingDocuments({});
      expect(result.documents.length).toBe(1);
    });
  });
});
