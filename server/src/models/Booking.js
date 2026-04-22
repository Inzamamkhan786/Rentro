const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vehicle_id',
    references: {
      model: 'vehicles',
      key: 'id',
    },
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date',
    validate: {
      isDate: { msg: 'Start date must be a valid date' },
    },
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date',
    validate: {
      isDate: { msg: 'End date must be a valid date' },
      isAfterStart(value) {
        if (value && this.startDate && new Date(value) <= new Date(this.startDate)) {
          throw new Error('End date must be after start date');
        }
      },
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
    validate: {
      isDecimal: { msg: 'Total price must be a number' },
      min: { args: [0], msg: 'Total price must be non-negative' },
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  paymentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'payment_id',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    defaultValue: 'pending',
    field: 'payment_status',
  },
  cancellationReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cancellation_reason',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
  getterMethods: {
    /**
     * Calculate booking duration in hours.
     */
    durationHours() {
      if (this.startDate && this.endDate) {
        const diffMs = new Date(this.endDate) - new Date(this.startDate);
        return Math.ceil(diffMs / (1000 * 60 * 60));
      }
      return 0;
    },
    /**
     * Calculate booking duration in days.
     */
    durationDays() {
      if (this.startDate && this.endDate) {
        const diffMs = new Date(this.endDate) - new Date(this.startDate);
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
      return 0;
    },
  },
});

module.exports = Booking;
