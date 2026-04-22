const {
  calculateDurationHours,
  calculateDurationDays,
  calculateRentalPrice,
  isValidDLNumber,
  isValidRegistrationNumber,
  isExpired,
  dateRangesOverlap,
  generateRandomString,
  sanitizeUser,
  getPagination,
} = require('../../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('calculateDurationHours', () => {
    it('should calculate hours between two dates', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-01T15:00:00Z';
      expect(calculateDurationHours(start, end)).toBe(5);
    });

    it('should round up partial hours', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-01T12:30:00Z';
      expect(calculateDurationHours(start, end)).toBe(3);
    });

    it('should throw on invalid dates', () => {
      expect(() => calculateDurationHours('invalid', '2024-01-01')).toThrow('Invalid date');
    });

    it('should throw when end is before start', () => {
      expect(() => calculateDurationHours('2024-01-02', '2024-01-01')).toThrow('End date must be after start date');
    });

    it('should throw when dates are equal', () => {
      const date = '2024-01-01T10:00:00Z';
      expect(() => calculateDurationHours(date, date)).toThrow('End date must be after start date');
    });
  });

  describe('calculateDurationDays', () => {
    it('should calculate days between two dates', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-03T10:00:00Z';
      expect(calculateDurationDays(start, end)).toBe(2);
    });

    it('should round up partial days', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-02T15:00:00Z';
      expect(calculateDurationDays(start, end)).toBe(2);
    });
  });

  describe('calculateRentalPrice', () => {
    it('should use hourly rate for less than 24 hours', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-01T15:00:00Z';
      expect(calculateRentalPrice(100, 1500, start, end)).toBe(500);
    });

    it('should use daily rate for 24+ hours', () => {
      const start = '2024-01-01T10:00:00Z';
      const end = '2024-01-03T10:00:00Z';
      expect(calculateRentalPrice(100, 1500, start, end)).toBe(3000);
    });

    it('should handle exactly 24 hours with daily rate', () => {
      const start = '2024-01-01T00:00:00Z';
      const end = '2024-01-02T00:00:00Z';
      expect(calculateRentalPrice(100, 1500, start, end)).toBe(1500);
    });
  });

  describe('isValidDLNumber', () => {
    it('should validate correct DL numbers', () => {
      expect(isValidDLNumber('MH12 20190000001')).toBe(true);
    });

    it('should reject invalid DL numbers', () => {
      expect(isValidDLNumber('INVALID')).toBe(false);
      expect(isValidDLNumber('')).toBe(false);
      expect(isValidDLNumber(null)).toBe(false);
      expect(isValidDLNumber(123)).toBe(false);
    });
  });

  describe('isValidRegistrationNumber', () => {
    it('should validate correct registration numbers', () => {
      expect(isValidRegistrationNumber('MH 12 AB 1234')).toBe(true);
      expect(isValidRegistrationNumber('MH12AB1234')).toBe(true);
    });

    it('should reject invalid registration numbers', () => {
      expect(isValidRegistrationNumber('INVALID')).toBe(false);
      expect(isValidRegistrationNumber('')).toBe(false);
      expect(isValidRegistrationNumber(null)).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      expect(isExpired('2020-01-01')).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isExpired(future)).toBe(false);
    });

    it('should throw for invalid dates', () => {
      expect(() => isExpired('not-a-date')).toThrow('Invalid date');
    });
  });

  describe('dateRangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      expect(dateRangesOverlap(
        '2024-01-01', '2024-01-05',
        '2024-01-03', '2024-01-08'
      )).toBe(true);
    });

    it('should detect contained ranges', () => {
      expect(dateRangesOverlap(
        '2024-01-01', '2024-01-10',
        '2024-01-03', '2024-01-05'
      )).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      expect(dateRangesOverlap(
        '2024-01-01', '2024-01-03',
        '2024-01-05', '2024-01-08'
      )).toBe(false);
    });

    it('should handle touching ranges (not overlapping)', () => {
      expect(dateRangesOverlap(
        '2024-01-01', '2024-01-03',
        '2024-01-03', '2024-01-05'
      )).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(20)).toHaveLength(20);
    });

    it('should generate default length of 10', () => {
      expect(generateRandomString()).toHaveLength(10);
    });

    it('should generate different strings', () => {
      const s1 = generateRandomString(20);
      const s2 = generateRandomString(20);
      expect(s1).not.toBe(s2);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from plain object', () => {
      const user = { name: 'Test', email: 'test@test.com', password: 'secret' };
      const sanitized = sanitizeUser(user);
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.name).toBe('Test');
    });

    it('should handle objects with toJSON method', () => {
      const user = {
        toJSON: () => ({ name: 'Test', password: 'secret' }),
      };
      const sanitized = sanitizeUser(user);
      expect(sanitized.password).toBeUndefined();
    });

    it('should return null for null input', () => {
      expect(sanitizeUser(null)).toBeNull();
    });
  });

  describe('getPagination', () => {
    it('should return default pagination', () => {
      const result = getPagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should parse page and limit from query', () => {
      const result = getPagination({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(20);
    });

    it('should enforce minimum page of 1', () => {
      const result = getPagination({ page: '-1' });
      expect(result.page).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = getPagination({ limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = getPagination({ limit: '1' });
      expect(result.limit).toBe(1);
    });

    it('should default limit when 0 is passed (falsy)', () => {
      const result = getPagination({ limit: '0' });
      expect(result.limit).toBe(10); // 0 is falsy, defaults to 10
    });
  });
});
