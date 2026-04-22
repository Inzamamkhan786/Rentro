const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Subject is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
    },
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved'),
    defaultValue: 'open',
  },
  adminReply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'support_tickets',
  timestamps: true,
  underscored: true,
});

module.exports = SupportTicket;
