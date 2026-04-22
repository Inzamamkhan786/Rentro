const { setupTestDB, teardownTestDB, clearDatabase } = require('../../helpers/testHelpers');
const { User } = require('../../../src/models');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('User Model', () => {
  const validUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'consumer',
  };

  describe('creation', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create(validUser);
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('consumer');
    });

    it('should hash password on creation', async () => {
      const user = await User.create(validUser);
      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]?\$/);
    });

    it('should set default values', async () => {
      const user = await User.create(validUser);
      expect(user.verified).toBe(false);
      expect(user.banned).toBe(false);
      expect(user.role).toBe('consumer');
    });

    it('should create provider role', async () => {
      const user = await User.create({ ...validUser, role: 'provider', email: 'p@t.com' });
      expect(user.role).toBe('provider');
    });

    it('should create admin role', async () => {
      const user = await User.create({ ...validUser, role: 'admin', email: 'a@t.com' });
      expect(user.role).toBe('admin');
    });
  });

  describe('validation', () => {
    it('should require name', async () => {
      await expect(User.create({ ...validUser, name: '' }))
        .rejects.toThrow();
    });

    it('should require email', async () => {
      await expect(User.create({ ...validUser, email: '' }))
        .rejects.toThrow();
    });

    it('should require valid email', async () => {
      await expect(User.create({ ...validUser, email: 'invalid-email' }))
        .rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await User.create(validUser);
      await expect(User.create(validUser))
        .rejects.toThrow();
    });

    it('should require password', async () => {
      await expect(User.create({ ...validUser, password: '' }))
        .rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      await expect(User.create({ ...validUser, password: '12345' }))
        .rejects.toThrow();
    });

    it('should reject invalid role', async () => {
      await expect(User.create({ ...validUser, role: 'invalid' }))
        .rejects.toThrow();
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const user = await User.create(validUser);
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create(validUser);
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('toSafeJSON', () => {
    it('should return object without password', async () => {
      const user = await User.create(validUser);
      const safe = user.toSafeJSON();
      expect(safe.password).toBeUndefined();
      expect(safe.name).toBe('John Doe');
      expect(safe.email).toBe('john@example.com');
    });
  });

  describe('hooks', () => {
    it('should hash password on update', async () => {
      const user = await User.create(validUser);
      const oldHash = user.password;
      user.password = 'newpassword456';
      await user.save();
      expect(user.password).not.toBe('newpassword456');
      expect(user.password).not.toBe(oldHash);
    });
  });
});
