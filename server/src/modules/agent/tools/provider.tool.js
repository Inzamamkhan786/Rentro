/**
 * tools/provider.tool.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SCHEMA + HANDLER for vehicle owner/provider operations:
 *   • get_incoming_rent_requests   — list pending bookings on their vehicles
 *   • respond_to_booking_request   — accept or reject from chat
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Op } = require('sequelize');
const { Vehicle, Booking, User } = require('../../../models');

// ─── Tool Schemas ─────────────────────────────────────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_incoming_rent_requests',
      description:
        'For vehicle owners: fetch booking requests on their listed vehicles. ' +
        'Defaults to pending (new) requests. Shows renter info, vehicle, dates, and amount.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'all'],
            description: 'Filter by status. Default is "pending".',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'respond_to_booking_request',
      description:
        'For vehicle owners: accept or reject an incoming booking request from chat. ' +
        '"accept" → confirmed. "reject" → cancelled.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'number', description: 'Booking ID to respond to' },
          action:    { type: 'string', enum: ['accept', 'reject'], description: '"accept" or "reject"' },
          reason:    { type: 'string', description: 'Optional reason (shown on rejection)' },
        },
        required: ['bookingId', 'action'],
      },
    },
  },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────
const handlers = {

  async get_incoming_rent_requests({ status }, userId) {
    try {
      const ownedVehicles = await Vehicle.findAll({
        where: { ownerId: userId },
        attributes: ['id'],
      });

      if (!ownedVehicles.length) {
        return JSON.stringify({ found: false, message: 'You have no vehicles listed on Rentora.' });
      }

      const vehicleIds   = ownedVehicles.map((v) => v.id);
      const filterStatus = status && status !== 'all' ? status : 'pending';

      const bookings = await Booking.findAll({
        where: { vehicleId: { [Op.in]: vehicleIds }, status: filterStatus },
        include: [
          { model: User,    as: 'user',    attributes: ['id', 'name', 'email', 'phone'] },
          { model: Vehicle, as: 'vehicle', attributes: ['id', 'title', 'type', 'brand'] },
        ],
        order: [['created_at', 'DESC']],
        limit: 10,
      });

      if (!bookings.length) {
        return JSON.stringify({
          found: false,
          message: `No ${filterStatus} booking requests found for your vehicles.`,
        });
      }

      return JSON.stringify({
        found: true,
        count: bookings.length,
        requests: bookings.map((b) => ({
          bookingId:   b.id,
          status:      b.status,
          renterName:  b.user?.name,
          renterEmail: b.user?.email,
          renterPhone: b.user?.phone,
          vehicle:     b.vehicle?.title,
          vehicleType: b.vehicle?.type,
          startDate:   b.startDate,
          endDate:     b.endDate,
          totalCost:   parseFloat(b.totalPrice),
          currency:    'INR',
          submittedAt: b.createdAt,
        })),
      });
    } catch (err) {
      return JSON.stringify({ error: err.message });
    }
  },

  async respond_to_booking_request({ bookingId, action, reason }, userId) {
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: Vehicle, as: 'vehicle' }],
      });

      if (!booking) return JSON.stringify({ success: false, error: `Booking #${bookingId} not found.` });
      if (booking.vehicle?.ownerId !== userId) {
        return JSON.stringify({ success: false, error: 'You are not the owner of this vehicle.' });
      }

      if (action === 'accept') {
        if (booking.status !== 'pending') {
          return JSON.stringify({ success: false, error: `Cannot accept — status is '${booking.status}'.` });
        }
        await booking.update({ status: 'confirmed' });
        return JSON.stringify({
          success: true, bookingId, newStatus: 'confirmed',
          message: `✅ Booking #${bookingId} accepted! The renter will be notified.`,
        });
      }

      if (action === 'reject') {
        if (['completed', 'cancelled'].includes(booking.status)) {
          return JSON.stringify({ success: false, error: `Cannot reject — status is '${booking.status}'.` });
        }
        await booking.update({ status: 'cancelled', cancellationReason: reason || 'Rejected by owner' });
        return JSON.stringify({
          success: true, bookingId, newStatus: 'cancelled',
          message: `❌ Booking #${bookingId} rejected and cancelled.`,
        });
      }

      return JSON.stringify({ success: false, error: 'Action must be "accept" or "reject".' });
    } catch (err) {
      return JSON.stringify({ success: false, error: err.message });
    }
  },

};

module.exports = { tools, handlers };
