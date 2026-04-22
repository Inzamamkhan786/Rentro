/**
 * Helper utility functions for Rentora platform.
 */

/**
 * Calculate the duration in hours between two dates.
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Duration in hours
 */
const calculateDurationHours = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60));
};

/**
 * Calculate the duration in days between two dates.
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Duration in days (rounded up)
 */
const calculateDurationDays = (startDate, endDate) => {
  const hours = calculateDurationHours(startDate, endDate);
  return Math.ceil(hours / 24);
};

/**
 * Calculate rental price based on duration and rates.
 * Uses daily rate if >= 24h, hourly rate otherwise.
 * @param {number} pricePerHour
 * @param {number} pricePerDay
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Total price
 */
const calculateRentalPrice = (pricePerHour, pricePerDay, startDate, endDate) => {
  const hours = calculateDurationHours(startDate, endDate);

  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return days * pricePerDay;
  }

  return hours * pricePerHour;
};

/**
 * Validate Indian Driving License number format.
 * Format: XX00 00000000000 (State code + RTO code + year + number)
 * @param {string} dlNumber
 * @returns {boolean}
 */
const isValidDLNumber = (dlNumber) => {
  if (!dlNumber || typeof dlNumber !== 'string') return false;
  const pattern = /^[A-Z]{2}\d{2}\s?\d{4}\d{7}$/;
  return pattern.test(dlNumber.trim());
};

/**
 * Validate Indian vehicle registration number.
 * Format: XX 00 XX 0000
 * @param {string} regNumber
 * @returns {boolean}
 */
const isValidRegistrationNumber = (regNumber) => {
  if (!regNumber || typeof regNumber !== 'string') return false;
  const pattern = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,3}\s?\d{4}$/;
  return pattern.test(regNumber.trim());
};

/**
 * Check if a date is expired (in the past).
 * @param {Date|string} date
 * @returns {boolean}
 */
const isExpired = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  return d < new Date();
};

/**
 * Check if two date ranges overlap.
 * @param {Date} start1
 * @param {Date} end1
 * @param {Date} start2
 * @param {Date} end2
 * @returns {boolean}
 */
const dateRangesOverlap = (start1, end1, start2, end2) => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  return s1 < e2 && s2 < e1;
};

/**
 * Generate a random alphanumeric string.
 * @param {number} length
 * @returns {string}
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize user object for API response (remove password).
 * @param {Object} user
 * @returns {Object}
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toJSON ? user.toJSON() : { ...user };
  delete obj.password;
  return obj;
};

/**
 * Build pagination parameters from query.
 * @param {Object} query - Express query object
 * @returns {{ page: number, limit: number, offset: number }}
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

module.exports = {
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
};
