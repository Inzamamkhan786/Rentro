const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../src/config/db');

// Initialize models and associations
require('../../src/models');

const { User, Vehicle, Booking, Document } = require('../../src/models');

/**
 * Setup test database - sync all models.
 */
const setupTestDB = async () => {
  await sequelize.sync({ force: true });
};

/**
 * Teardown test database - close connection.
 */
const teardownTestDB = async () => {
  await sequelize.close();
};

/**
 * Clear all tables between tests.
 */
const clearDatabase = async () => {
  await Document.destroy({ where: {}, force: true });
  await Booking.destroy({ where: {}, force: true });
  await Vehicle.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
};

/**
 * Create a test user and return user + JWT token.
 * @param {Object} overrides
 * @returns {{ user: Object, token: string }}
 */
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: 'password123',
    role: 'consumer',
    ...overrides,
  };

  const user = await User.create(userData);
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing',
    { expiresIn: '1h' }
  );

  return { user, token };
};

/**
 * Create a test provider user.
 */
const createTestProvider = async (overrides = {}) => {
  return createTestUser({ role: 'provider', name: 'Test Provider', ...overrides });
};

/**
 * Create a test admin user.
 */
const createTestAdmin = async (overrides = {}) => {
  return createTestUser({ role: 'admin', name: 'Test Admin', ...overrides });
};

/**
 * Create a test vehicle.
 * @param {number} ownerId
 * @param {Object} overrides
 * @returns {Object}
 */
const createTestVehicle = async (ownerId, overrides = {}) => {
  return Vehicle.create({
    ownerId,
    title: 'Test Car 2024',
    type: 'car',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    pricePerHour: 100,
    pricePerDay: 1500,
    location: 'Mumbai, Maharashtra',
    images: ['image1.jpg'],
    availability: true,
    verified: true,
    specs: { fuel: 'Petrol', seats: 5 },
    ...overrides,
  });
};

/**
 * Create a test booking.
 * @param {number} userId
 * @param {number} vehicleId
 * @param {Object} overrides
 * @returns {Object}
 */
const createTestBooking = async (userId, vehicleId, overrides = {}) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);

  return Booking.create({
    userId,
    vehicleId,
    startDate,
    endDate,
    totalPrice: 3000,
    status: 'pending',
    paymentStatus: 'pending',
    ...overrides,
  });
};

/**
 * Create a test document.
 */
const createTestDocument = async (userId, overrides = {}) => {
  return Document.create({
    userId,
    type: 'DL',
    fileUrl: '/uploads/test-dl.jpg',
    status: 'pending',
    extractedData: { dlNumber: 'MH12 20190000001', name: 'Test User' },
    ...overrides,
  });
};

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearDatabase,
  createTestUser,
  createTestProvider,
  createTestAdmin,
  createTestVehicle,
  createTestBooking,
  createTestDocument,
};
