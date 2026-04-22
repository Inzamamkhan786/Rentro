const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getPagination } = require('../../utils/helpers');

/**
 * Get user by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

/**
 * Update user profile.
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent updating sensitive fields directly
  const allowedFields = ['name', 'phone', 'avatar'];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  await user.update(updateData);
  return user.toSafeJSON();
};

/**
 * Get all users with filters and pagination.
 * @param {Object} query - Query parameters
 * @returns {Promise<{ users: Array, total: number, page: number, limit: number }>}
 */
const getAllUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};

  if (query.role) {
    where.role = query.role;
  }
  if (query.verified !== undefined) {
    where.verified = query.verified === 'true';
  }
  if (query.banned !== undefined) {
    where.banned = query.banned === 'true';
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return { users: rows, total: count, page, limit };
};

/**
 * Delete user (soft concept - ban them).
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  await user.destroy();
};

/**
 * Get user statistics.
 * @returns {Promise<Object>}
 */
const getUserStats = async () => {
  const total = await User.count();
  const consumers = await User.count({ where: { role: 'consumer' } });
  const providers = await User.count({ where: { role: 'provider' } });
  const verified = await User.count({ where: { verified: true } });
  const banned = await User.count({ where: { banned: true } });

  return { total, consumers, providers, verified, banned };
};

module.exports = {
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  getUserStats,
};
