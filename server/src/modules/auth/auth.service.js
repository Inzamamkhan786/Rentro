const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Register a new user.
 * @param {Object} userData - { name, email, password, role, phone }
 * @returns {Promise<{ user: Object, token: string }>}
 */
const register = async (userData) => {
  const { name, email, password, role, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create user (password is hashed by model hook)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'consumer',
    phone,
  });

  const token = generateToken(user.id);

  return {
    user: user.toSafeJSON(),
    token,
  };
};

/**
 * Login a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.banned) {
    throw ApiError.forbidden('Account has been suspended. Reason: ' + (user.banReason || 'N/A'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user.id);

  return {
    user: user.toSafeJSON(),
    token,
  };
};

/**
 * Generate JWT token for a user.
 * @param {number} userId
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  if (!token) {
    throw ApiError.unauthorized('Token is required');
  }

  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw ApiError.unauthorized('Invalid token');
  }
};

/**
 * Change user password.
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<Object>} Updated user
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return user.toSafeJSON();
};

/**
 * Get user profile by ID.
 * @param {number} userId
 * @returns {Promise<Object>}
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

module.exports = {
  register,
  login,
  generateToken,
  verifyToken,
  changePassword,
  getProfile,
};
