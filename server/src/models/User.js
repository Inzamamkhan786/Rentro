const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Email already exists' },
    validate: {
      notEmpty: { msg: 'Email is required' },
      isEmail: { msg: 'Must be a valid email address' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM('consumer', 'provider', 'admin'),
    defaultValue: 'consumer',
    allowNull: false,
    validate: {
      isIn: {
        args: [['consumer', 'provider', 'admin']],
        msg: 'Role must be consumer, provider, or admin',
      },
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  banReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'ban_reason',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

/**
 * Compare a candidate password with the stored hashed password.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return user JSON without password.
 * @returns {Object}
 */
User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
