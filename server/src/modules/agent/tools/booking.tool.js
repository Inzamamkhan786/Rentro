/**
 * tools/booking.tool.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SCHEMA + HANDLER for all consumer booking operations:
 *   • search_cheapest_vehicle   — find cheapest available vehicles
 *   • book_vehicle              — create a booking & return total cost
 *   • get_my_bookings           — list the consumer's own bookings
 *   • cancel_booking            — cancel a booking by ID
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Op } = require('sequelize');
const { Vehicle, Booking, User } = require('../../../models');
const bookingService = require('../../bookings/booking.service');

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * Maps natural-language input → exact ENUM value ('car' | 'bike' | 'scooter').
 * The `type` column is a PostgreSQL ENUM — Op.iLike would crash on it.
 */
const normalizeType = (raw) => {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (['car', 'bike', 'scooter'].includes(t)) return t;
  if (t.includes('scooter') || t.includes('scooty') || t.includes('vespa') || t.includes('moped')) return 'scooter';
  if (t.includes('bike') || t.includes('motorcycle') || t.includes('motorbike')) return 'bike';
  if (t.includes('car') || t.includes('sedan') || t.includes('suv') || t.includes('hatchback')) return 'car';
  return null;
};

// ─── Tool Schemas ─────────────────────────────────────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_cheapest_vehicle',
      description:
        'Search for the cheapest available vehicles by type and location. ' +
        'Returns up to 5 results sorted by hourly price. ' +
        'Always call this FIRST before booking to get valid vehicle IDs and prices.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['car', 'bike', 'scooter'],
            description: '"scooter" for scooters/Vespa/mopeds, "bike" for motorcycles, "car" for cars/SUVs',
          },
          brand: {
            type: 'string',
            description: 'Optional brand filter, e.g. "Vespa", "Honda"',
          },
          location: {
            type: 'string',
            description: 'City name only, e.g. "Nagpur" — no "near" or place-name prefix',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_vehicle',
      description:
        'Create a booking for a vehicle using its ID from search_cheapest_vehicle. ' +
        'For hourly bookings include time: "2026-06-15T09:00:00". ' +
        'Returns booking ID and total cost in INR.',
      parameters: {
        type: 'object',
        properties: {
          vehicleId: { type: 'number', description: 'Vehicle ID from search results' },
          startDate: { type: 'string', description: 'ISO 8601 start, e.g. "2026-06-15T09:00:00"' },
          endDate:   { type: 'string', description: 'ISO 8601 end,   e.g. "2026-06-15T14:00:00"' },
        },
        required: ['vehicleId', 'startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_bookings',
      description: 'List all bookings made by the logged-in consumer with vehicle details and costs.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
            description: 'Optional status filter',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_booking',
      description: 'Cancel an existing booking by its ID.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'number', description: 'Booking ID to cancel' },
          reason:    { type: 'string', description: 'Optional cancellation reason' },
        },
        required: ['bookingId'],
      },
    },
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────
const handlers = {

  async search_cheapest_vehicle({ type, brand, location }) {
    try {
      const where = { availability: true, verified: true };

      const norm = normalizeType(type);
      if (norm) where.type = norm;
      if (brand) where.brand = { [Op.iLike]: `%${brand}%` };
      if (location) {
        const city = location.replace(/^(near|in|at|around)\s+/i, '').trim();
        where.location = { [Op.iLike]: `%${city}%` };
      }

      console.log('[booking:search] where =', JSON.stringify(where));

      const vehicles = await Vehicle.findAll({
        where,
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'phone'] }],
        order: [['pricePerHour', 'ASC']],
        limit: 5,
      });

      if (!vehicles.length) {
        let msg = `No available ${brand ? brand + ' ' : ''}${norm || type || 'vehicle'}s found`;
        if (location) msg += ` near ${location}`;
        return JSON.stringify({ found: false, message: msg + '. Try a broader search.' });
      }

      return JSON.stringify({
        found: true,
        count: vehicles.length,
        vehicles: vehicles.map((v) => ({
          id:           v.id,
          title:        v.title,
          type:         v.type,
          brand:        v.brand,
          model:        v.model,
          year:         v.year,
          pricePerHour: parseFloat(v.pricePerHour),
          pricePerDay:  parseFloat(v.pricePerDay),
          location:     v.location,
          owner:        v.owner?.name,
        })),
      });
    } catch (err) {
      console.error('[booking:search] error:', err.message);
      return JSON.stringify({ found: false, error: err.message });
    }
  },

  async book_vehicle({ vehicleId, startDate, endDate }, userId) {
    try {
      const booking = await bookingService.createBooking(userId, vehicleId, { startDate, endDate });
      const vehicle = await Vehicle.findByPk(vehicleId, { attributes: ['title'] });

      const hours = Math.ceil((new Date(endDate) - new Date(startDate)) / 3_600_000);
      const dur   = hours < 24 ? `${hours} hour(s)` : `${Math.ceil(hours / 24)} day(s)`;
      const cost  = parseFloat(booking.totalPrice).toFixed(2);

      return JSON.stringify({
        success:   true,
        bookingId: booking.id,
        vehicle:   vehicle?.title,
        startDate, endDate,
        durationHours: hours,
        totalCost: parseFloat(cost),
        currency:  'INR',
        status:    booking.status,
        message:   `✅ Booking confirmed! ${vehicle?.title} booked for ${dur}. Total: ₹${cost}.`,
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: err.message });
    }
  },

  async get_my_bookings({ status }, userId) {
    try {
      const where = { userId };
      if (status) where.status = status;

      const bookings = await Booking.findAll({
        where,
        include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'title', 'brand', 'type', 'location'] }],
        order: [['created_at', 'DESC']],
        limit: 10,
      });

      if (!bookings.length) return JSON.stringify({ found: false, message: 'No bookings found.' });

      return JSON.stringify({
        found: true,
        count: bookings.length,
        bookings: bookings.map((b) => ({
          id:            b.id,
          status:        b.status,
          vehicle:       b.vehicle?.title,
          location:      b.vehicle?.location,
          startDate:     b.startDate,
          endDate:       b.endDate,
          totalCost:     parseFloat(b.totalPrice),
          currency:      'INR',
          paymentStatus: b.paymentStatus,
        })),
      });
    } catch (err) {
      return JSON.stringify({ error: err.message });
    }
  },

  async cancel_booking({ bookingId, reason }, userId) {
    try {
      await bookingService.cancelBooking(bookingId, userId, reason || 'Cancelled via AI Agent');
      return JSON.stringify({
        success: true, bookingId,
        message: `✅ Booking #${bookingId} successfully cancelled.`,
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: err.message });
    }
  },

};

module.exports = { tools, handlers };
