const jwt = require('jsonwebtoken');
const { setupTestDB, teardownTestDB, clearDatabase, createTestUser } = require('../../helpers/testHelpers');
const { authenticate, optionalAuth } = require('../../../src/middleware/auth.middleware');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Auth Middleware', () => {
  const mockRes = {};
  
  describe('authenticate', () => {
    it('should authenticate with valid token', async () => {
      const { user, token } = await createTestUser();
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.userId).toBe(user.id);
    });

    it('should reject missing authorization header', async () => {
      const req = { headers: {} };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject invalid format (no Bearer)', async () => {
      const req = { headers: { authorization: 'Token abc123' } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject expired token', async () => {
      const { user } = await createTestUser();
      const expiredToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing',
        { expiresIn: '0s' }
      );

      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const next = jest.fn();

      // Wait briefly for token to expire
      await new Promise((r) => setTimeout(r, 100));
      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject invalid token', async () => {
      const req = { headers: { authorization: 'Bearer invalidtokenhere' } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject token for non-existent user', async () => {
      const token = jwt.sign(
        { userId: 99999 },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing',
        { expiresIn: '1h' }
      );
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject banned user', async () => {
      const { user, token } = await createTestUser();
      await user.update({ banned: true });

      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403,
      }));
    });

    it('should reject empty Bearer token', async () => {
      const req = { headers: { authorization: 'Bearer ' } };
      const next = jest.fn();

      await authenticate(req, mockRes, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });
  });

  describe('optionalAuth', () => {
    it('should attach user with valid token', async () => {
      const { user, token } = await createTestUser();
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();

      await optionalAuth(req, mockRes, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.userId).toBe(user.id);
    });

    it('should continue without error when no token', async () => {
      const req = { headers: {} };
      const next = jest.fn();

      await optionalAuth(req, mockRes, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should continue without error when token is invalid', async () => {
      const req = { headers: { authorization: 'Bearer invalidtoken' } };
      const next = jest.fn();

      await optionalAuth(req, mockRes, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });
});
