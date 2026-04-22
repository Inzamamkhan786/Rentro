const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
      len: { args: [3, 200], msg: 'Title must be between 3 and 200 characters' },
    },
  },
  type: {
    type: DataTypes.ENUM('car', 'bike', 'scooter'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['car', 'bike', 'scooter']],
        msg: 'Vehicle type must be car, bike, or scooter',
      },
    },
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Brand is required' },
    },
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Model is required' },
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Year must be an integer' },
      min: { args: [1990], msg: 'Year must be 1990 or later' },
      max: { args: [new Date().getFullYear() + 1], msg: 'Year cannot be in the future' },
    },
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_hour',
    validate: {
      isDecimal: { msg: 'Price per hour must be a number' },
      min: { args: [0], msg: 'Price per hour must be non-negative' },
    },
  },
  pricePerDay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_day',
    validate: {
      isDecimal: { msg: 'Price per day must be a number' },
      min: { args: [0], msg: 'Price per day must be non-negative' },
    },
  },
  location: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Location is required' },
    },
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  specs: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'vehicles',
  timestamps: true,
  underscored: true,
});

module.exports = Vehicle;
