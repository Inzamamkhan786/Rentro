const { setupTestDB, teardownTestDB, clearDatabase, createTestUser, createTestVehicle, createTestBooking, createTestDocument } = require('../../helpers/testHelpers');
const adminService = require('../../../src/modules/admin/admin.service');

beforeAll(async () => { await setupTestDB(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await teardownTestDB(); });

describe('Admin Service', () => {
  describe('getDashboardStats', () => {
    it('should return platform stats', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      await createTestUser({ role: 'consumer' });
      await createTestVehicle(p.id);
      const stats = await adminService.getDashboardStats();
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalVehicles).toBe(1);
    });

    it('should return zeros for empty platform', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.totalUsers).toBe(0);
      expect(stats.totalVehicles).toBe(0);
      expect(stats.totalRevenue).toBe(0);
    });
  });

  describe('banUser', () => {
    it('should ban a user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      const banned = await adminService.banUser(user.id, 'Violation');
      expect(banned.banned).toBe(true);
      expect(banned.banReason).toBe('Violation');
    });

    it('should not ban an admin', async () => {
      const { user } = await createTestUser({ role: 'admin' });
      await expect(adminService.banUser(user.id, 'Test')).rejects.toThrow('Cannot ban an admin');
    });

    it('should throw for already banned user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await adminService.banUser(user.id, 'First ban');
      await expect(adminService.banUser(user.id, 'Second ban')).rejects.toThrow('already banned');
    });

    it('should throw for non-existent user', async () => {
      await expect(adminService.banUser(99999, 'Test')).rejects.toThrow('User not found');
    });
  });

  describe('unbanUser', () => {
    it('should unban a banned user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await adminService.banUser(user.id, 'Violation');
      const unbanned = await adminService.unbanUser(user.id);
      expect(unbanned.banned).toBe(false);
      expect(unbanned.banReason).toBeNull();
    });

    it('should throw for non-banned user', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await expect(adminService.unbanUser(user.id)).rejects.toThrow('User is not banned');
    });
  });

  describe('approveVehicle', () => {
    it('should approve a vehicle', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      const vehicle = await createTestVehicle(p.id, { verified: false });
      const approved = await adminService.approveVehicle(vehicle.id);
      expect(approved.verified).toBe(true);
    });

    it('should throw for already verified vehicle', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      const vehicle = await createTestVehicle(p.id, { verified: true });
      await expect(adminService.approveVehicle(vehicle.id)).rejects.toThrow('already verified');
    });

    it('should throw for non-existent vehicle', async () => {
      await expect(adminService.approveVehicle(99999)).rejects.toThrow('Vehicle not found');
    });
  });

  describe('removeVehicle', () => {
    it('should remove a vehicle and cancel its bookings', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      const { user: c } = await createTestUser({ role: 'consumer' });
      const vehicle = await createTestVehicle(p.id);
      await createTestBooking(c.id, vehicle.id, { status: 'pending' });

      await adminService.removeVehicle(vehicle.id, 'Policy violation');
      const { Vehicle } = require('../../../src/models');
      const found = await Vehicle.findByPk(vehicle.id);
      expect(found).toBeNull();
    });

    it('should throw for non-existent vehicle', async () => {
      await expect(adminService.removeVehicle(99999, 'Test')).rejects.toThrow('Vehicle not found');
    });
  });

  describe('getPendingVerifications', () => {
    it('should return pending documents', async () => {
      const { user } = await createTestUser({ role: 'consumer' });
      await createTestDocument(user.id, { status: 'pending' });
      const result = await adminService.getPendingVerifications({});
      expect(result.documents.length).toBe(1);
    });
  });

  describe('getRevenueReport', () => {
    it('should calculate total revenue', async () => {
      const { user: p } = await createTestUser({ role: 'provider' });
      const { user: c } = await createTestUser({ role: 'consumer' });
      const vehicle = await createTestVehicle(p.id);
      await createTestBooking(c.id, vehicle.id, { paymentStatus: 'paid', totalPrice: 2000 });
      await createTestBooking(c.id, vehicle.id, { paymentStatus: 'paid', totalPrice: 3000,
        startDate: new Date(Date.now() + 500000000), endDate: new Date(Date.now() + 600000000) });

      const report = await adminService.getRevenueReport({});
      expect(report.totalRevenue).toBe(5000);
      expect(report.totalTransactions).toBe(2);
    });

    it('should return zero for no transactions', async () => {
      const report = await adminService.getRevenueReport({});
      expect(report.totalRevenue).toBe(0);
    });
  });

  describe('getAllUsers', () => {
    it('should return filtered users', async () => {
      await createTestUser({ role: 'consumer', name: 'Alice' });
      await createTestUser({ role: 'provider', name: 'Bob' });
      const result = await adminService.getAllUsers({ role: 'consumer' });
      expect(result.users.length).toBe(1);
    });

    it('should support search', async () => {
      await createTestUser({ role: 'consumer', name: 'Alice Smith' });
      await createTestUser({ role: 'consumer', name: 'Bob Jones' });
      const result = await adminService.getAllUsers({ search: 'Alice' });
      expect(result.users.length).toBe(1);
    });
  });
});
