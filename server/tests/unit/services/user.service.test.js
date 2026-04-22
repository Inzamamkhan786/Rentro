const { setupTestDB, teardownTestDB, clearDatabase, createTestUser } = require('../../helpers/testHelpers');
const userService = require('../../../src/modules/users/user.service');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const { user } = await createTestUser();
      const found = await userService.getUserById(user.id);
      expect(found.id).toBe(user.id);
      expect(found.password).toBeUndefined();
    });

    it('should throw for non-existent user', async () => {
      await expect(userService.getUserById(99999)).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update allowed fields', async () => {
      const { user } = await createTestUser();
      const updated = await userService.updateUser(user.id, { name: 'Updated Name', phone: '1234567890' });
      expect(updated.name).toBe('Updated Name');
      expect(updated.phone).toBe('1234567890');
    });

    it('should not update disallowed fields', async () => {
      const { user } = await createTestUser();
      const updated = await userService.updateUser(user.id, { role: 'admin', email: 'hack@test.com' });
      expect(updated.role).not.toBe('admin');
    });

    it('should throw for non-existent user', async () => {
      await expect(userService.updateUser(99999, { name: 'Test' })).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      await createTestUser({ name: 'User 1' });
      await createTestUser({ name: 'User 2' });
      await createTestUser({ name: 'User 3' });

      const result = await userService.getAllUsers({ page: '1', limit: '2' });
      expect(result.users.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
    });

    it('should filter by role', async () => {
      await createTestUser({ role: 'consumer' });
      await createTestUser({ role: 'provider' });

      const result = await userService.getAllUsers({ role: 'provider' });
      expect(result.users.length).toBe(1);
      expect(result.users[0].role).toBe('provider');
    });

    it('should return empty for no matches', async () => {
      const result = await userService.getAllUsers({ role: 'admin' });
      expect(result.users.length).toBe(0);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const { user } = await createTestUser();
      await userService.deleteUser(user.id);
      await expect(userService.getUserById(user.id)).rejects.toThrow('User not found');
    });

    it('should throw for non-existent user', async () => {
      await expect(userService.deleteUser(99999)).rejects.toThrow('User not found');
    });
  });

  describe('getUserStats', () => {
    it('should return correct stats', async () => {
      await createTestUser({ role: 'consumer' });
      await createTestUser({ role: 'consumer' });
      await createTestUser({ role: 'provider' });

      const stats = await userService.getUserStats();
      expect(stats.total).toBe(3);
      expect(stats.consumers).toBe(2);
      expect(stats.providers).toBe(1);
    });

    it('should return zero counts for empty database', async () => {
      const stats = await userService.getUserStats();
      expect(stats.total).toBe(0);
    });
  });
});
