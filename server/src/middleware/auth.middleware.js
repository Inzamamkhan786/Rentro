const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header and attaches user to request.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('No authorization token provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Invalid token format. Use: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Token is empty');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired');
      }
      if (jwtError.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid token');
      }
      throw ApiError.unauthorized('Token verification failed');
    }

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.banned) {
      throw ApiError.forbidden('Account has been suspended');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token present, continues if not.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      const user = await User.findByPk(decoded.userId);
      if (user && !user.banned) {
        req.user = user;
        req.userId = user.id;
      }
    } catch {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate, optionalAuth };
