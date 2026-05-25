const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'booking_id',
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sender_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'receiver_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Message content cannot be empty' },
    },
  },
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
});

module.exports = Message;
