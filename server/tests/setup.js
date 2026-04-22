// Jest global setup for Rentora tests
// Sets NODE_ENV to test before any test runs

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.SESSION_SECRET = 'test-session-secret';
