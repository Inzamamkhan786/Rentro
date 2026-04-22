module.exports = {
  testEnvironment: 'node',
  setupFilesAfterSetup: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/cloudinary.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov'],
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
};
