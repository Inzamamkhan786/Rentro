const {
  extractDLData,
  extractRCData,
  extractPUCData,
  validateExtractedDL,
  validateExtractedRC,
  validateExtractedPUC,
} = require('../../../src/utils/ocr');

describe('OCR Module', () => {
  describe('extractDLData', () => {
    it('should extract DL data from file URL', async () => {
      const data = await extractDLData('/uploads/dl.jpg');
      expect(data).toHaveProperty('dlNumber');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('expiryDate');
      expect(data).toHaveProperty('confidence');
    });

    it('should throw without file URL', async () => {
      await expect(extractDLData(null)).rejects.toThrow('File URL is required');
      await expect(extractDLData('')).rejects.toThrow('File URL is required');
    });
  });

  describe('extractRCData', () => {
    it('should extract RC data from file URL', async () => {
      const data = await extractRCData('/uploads/rc.jpg');
      expect(data).toHaveProperty('registrationNumber');
      expect(data).toHaveProperty('ownerName');
      expect(data).toHaveProperty('expiryDate');
    });

    it('should throw without file URL', async () => {
      await expect(extractRCData(null)).rejects.toThrow('File URL is required');
    });
  });

  describe('extractPUCData', () => {
    it('should extract PUC data from file URL', async () => {
      const data = await extractPUCData('/uploads/puc.jpg');
      expect(data).toHaveProperty('vehicleNumber');
      expect(data).toHaveProperty('expiryDate');
      expect(data).toHaveProperty('result');
    });

    it('should throw without file URL', async () => {
      await expect(extractPUCData('')).rejects.toThrow('File URL is required');
    });
  });

  describe('validateExtractedDL', () => {
    it('should validate valid DL data', () => {
      const data = {
        dlNumber: 'MH12 20190000001',
        name: 'Test User',
        expiryDate: '2039-06-01',
        confidence: 0.85,
      };
      const result = validateExtractedDL(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should flag missing DL number', () => {
      const result = validateExtractedDL({ name: 'Test', expiryDate: '2039-01-01' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('DL number not found');
    });

    it('should flag missing name', () => {
      const result = validateExtractedDL({ dlNumber: 'DL123', expiryDate: '2039-01-01' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name not found');
    });

    it('should flag expired DL', () => {
      const result = validateExtractedDL({
        dlNumber: 'DL123',
        name: 'Test',
        expiryDate: '2020-01-01',
        confidence: 0.9,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Driving license has expired');
    });

    it('should flag low confidence', () => {
      const result = validateExtractedDL({
        dlNumber: 'DL123',
        name: 'Test',
        expiryDate: '2039-01-01',
        confidence: 0.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Low OCR confidence, manual review required');
    });

    it('should return invalid for null data', () => {
      const result = validateExtractedDL(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No data provided');
    });
  });

  describe('validateExtractedRC', () => {
    it('should validate valid RC data', () => {
      const data = {
        registrationNumber: 'MH 12 AB 1234',
        ownerName: 'Test Owner',
        expiryDate: '2035-03-15',
        confidence: 0.88,
      };
      const result = validateExtractedRC(data);
      expect(result.isValid).toBe(true);
    });

    it('should flag missing registration number', () => {
      const result = validateExtractedRC({ ownerName: 'Test', expiryDate: '2035-01-01' });
      expect(result.errors).toContain('Registration number not found');
    });

    it('should flag expired RC', () => {
      const result = validateExtractedRC({
        registrationNumber: 'MH12AB1234',
        ownerName: 'Test',
        expiryDate: '2020-01-01',
      });
      expect(result.errors).toContain('Registration certificate has expired');
    });

    it('should return invalid for null data', () => {
      const result = validateExtractedRC(null);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateExtractedPUC', () => {
    it('should validate valid PUC data', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const data = {
        vehicleNumber: 'MH 12 AB 1234',
        expiryDate: future.toISOString(),
        result: 'PASS',
        confidence: 0.82,
      };
      const result = validateExtractedPUC(data);
      expect(result.isValid).toBe(true);
    });

    it('should flag missing vehicle number', () => {
      const result = validateExtractedPUC({ expiryDate: '2039-01-01', result: 'PASS' });
      expect(result.errors).toContain('Vehicle number not found');
    });

    it('should flag failed PUC test', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const result = validateExtractedPUC({
        vehicleNumber: 'MH12AB1234',
        expiryDate: future.toISOString(),
        result: 'FAIL',
      });
      expect(result.errors).toContain('Vehicle did not pass pollution test');
    });

    it('should flag expired PUC', () => {
      const result = validateExtractedPUC({
        vehicleNumber: 'MH12AB1234',
        expiryDate: '2020-01-01',
        result: 'PASS',
      });
      expect(result.errors).toContain('PUC certificate has expired');
    });

    it('should return invalid for null data', () => {
      const result = validateExtractedPUC(null);
      expect(result.isValid).toBe(false);
    });
  });
});
