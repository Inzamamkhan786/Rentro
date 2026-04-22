const { setupTestDB, teardownTestDB, clearDatabase, createTestUser } = require('../../helpers/testHelpers');
const { Vehicle, User } = require('../../../src/models');

beforeAll(async () => {
  await setupTestDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Vehicle Model', () => {
  let provider;

  beforeEach(async () => {
    const result = await createTestUser({ role: 'provider' });
    provider = result.user;
  });

  const getValidVehicle = (ownerId) => ({
    ownerId,
    title: 'Toyota Camry 2024',
    type: 'car',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    pricePerHour: 100,
    pricePerDay: 1500,
    location: 'Mumbai, Maharashtra',
    images: ['img1.jpg', 'img2.jpg'],
  });

  describe('creation', () => {
    it('should create a vehicle with valid data', async () => {
      const vehicle = await Vehicle.create(getValidVehicle(provider.id));
      expect(vehicle.id).toBeDefined();
      expect(vehicle.title).toBe('Toyota Camry 2024');
      expect(vehicle.type).toBe('car');
    });

    it('should set default values', async () => {
      const vehicle = await Vehicle.create(getValidVehicle(provider.id));
      expect(vehicle.availability).toBe(true);
      expect(vehicle.verified).toBe(false);
    });

    it('should accept bike type', async () => {
      const vehicle = await Vehicle.create({
        ...getValidVehicle(provider.id),
        type: 'bike',
      });
      expect(vehicle.type).toBe('bike');
    });

    it('should accept scooter type', async () => {
      const vehicle = await Vehicle.create({
        ...getValidVehicle(provider.id),
        type: 'scooter',
      });
      expect(vehicle.type).toBe('scooter');
    });

    it('should store JSON images array', async () => {
      const vehicle = await Vehicle.create(getValidVehicle(provider.id));
      expect(vehicle.images).toEqual(['img1.jpg', 'img2.jpg']);
    });

    it('should store JSON specs', async () => {
      const vehicle = await Vehicle.create({
        ...getValidVehicle(provider.id),
        specs: { fuel: 'Petrol', seats: 5, transmission: 'Automatic' },
      });
      expect(vehicle.specs.fuel).toBe('Petrol');
      expect(vehicle.specs.seats).toBe(5);
    });
  });

  describe('validation', () => {
    it('should require title', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), title: '' }))
        .rejects.toThrow();
    });

    it('should require type', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), type: null }))
        .rejects.toThrow();
    });

    it('should reject invalid type', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), type: 'truck' }))
        .rejects.toThrow();
    });

    it('should require brand', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), brand: '' }))
        .rejects.toThrow();
    });

    it('should require location', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), location: '' }))
        .rejects.toThrow();
    });

    it('should validate price is non-negative', async () => {
      await expect(Vehicle.create({ ...getValidVehicle(provider.id), pricePerHour: -10 }))
        .rejects.toThrow();
    });
  });

  describe('associations', () => {
    it('should belong to an owner (User)', async () => {
      const vehicle = await Vehicle.create(getValidVehicle(provider.id));
      const foundVehicle = await Vehicle.findByPk(vehicle.id, {
        include: [{ model: User, as: 'owner' }],
      });
      expect(foundVehicle.owner).toBeDefined();
      expect(foundVehicle.owner.id).toBe(provider.id);
    });
  });
});
