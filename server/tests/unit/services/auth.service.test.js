const { setupTestDB, teardownTestDB, clearDatabase, createTestUser } = require('../../helpers/testHelpers');
const authService = require('../../../src/modules/auth/auth.service');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Auth Service', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'consumer',
      });

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.password).toBeUndefined();
    });

    it('should register a provider', async () => {
      const result = await authService.register({
        name: 'Provider',
        email: 'provider@example.com',
        password: 'password123',
        role: 'provider',
      });

      expect(result.user.role).toBe('provider');
    });

    it('should default to consumer role', async () => {
      const result = await authService.register({
        name: 'User',
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.user.role).toBe('consumer');
    });

    it('should throw error for duplicate email', async () => {
      await authService.register({
        name: 'User 1',
        email: 'dup@example.com',
        password: 'password123',
      });

      await expect(authService.register({
        name: 'User 2',
        email: 'dup@example.com',
        password: 'password456',
      })).rejects.toThrow('User with this email already exists');
    });

    it('should hash the password', async () => {
      const result = await authService.register({
        name: 'User',
        email: 'hash@example.com',
        password: 'password123',
      });

      expect(result.user.password).toBeUndefined();
    });

    it('should include phone if provided', async () => {
      const result = await authService.register({
        name: 'User',
        email: 'phone@example.com',
        password: 'password123',
        phone: '9876543210',
      });

      expect(result.user.phone).toBe('9876543210');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login('login@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw for wrong password', async () => {
      await expect(authService.login('login@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw for non-existent email', async () => {
      await expect(authService.login('none@example.com', 'password123'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw for empty credentials', async () => {
      await expect(authService.login('', ''))
        .rejects.toThrow('Email and password are required');
    });

    it('should throw for banned user', async () => {
      const { User } = require('../../../src/models');
      await User.update({ banned: true, banReason: 'Test ban' }, {
        where: { email: 'login@example.com' },
      });

      await expect(authService.login('login@example.com', 'password123'))
        .rejects.toThrow('Account has been suspended');
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = authService.generateToken(1);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = authService.generateToken(42);
      const decoded = authService.verifyToken(token);
      expect(decoded.userId).toBe(42);
    });

    it('should throw for empty token', () => {
      expect(() => authService.verifyToken('')).toThrow('Token is required');
      expect(() => authService.verifyToken(null)).toThrow('Token is required');
    });

    it('should throw for invalid token', () => {
      expect(() => authService.verifyToken('invalid.token.here')).toThrow('Invalid token');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const { user } = await createTestUser();

      const result = await authService.changePassword(user.id, 'password123', 'newpassword456');
      expect(result).toBeDefined();

      // Verify new password works
      const loginResult = await authService.login(user.email, 'newpassword456');
      expect(loginResult.token).toBeDefined();
    });

    it('should throw for wrong old password', async () => {
      const { user } = await createTestUser();

      await expect(authService.changePassword(user.id, 'wrongold', 'newpass'))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw for non-existent user', async () => {
      await expect(authService.changePassword(99999, 'old', 'new'))
        .rejects.toThrow('User not found');
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const { user } = await createTestUser();

      const profile = await authService.getProfile(user.id);
      expect(profile.name).toBe(user.name);
      expect(profile.password).toBeUndefined();
    });

    it('should throw for non-existent user', async () => {
      await expect(authService.getProfile(99999))
        .rejects.toThrow('User not found');
    });
  });
});
