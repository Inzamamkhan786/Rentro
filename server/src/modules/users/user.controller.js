const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * GET /api/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(user));
});

/**
 * PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(parseInt(req.params.id, 10), req.body);
  res.status(200).json(ApiResponse.ok(user, 'Profile updated'));
});

/**
 * GET /api/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.status(200).json(ApiResponse.paginated(result.users, result.page, result.limit, result.total));
});

/**
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(null, 'User deleted'));
});

/**
 * GET /api/users/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  res.status(200).json(ApiResponse.ok(stats));
});

module.exports = {
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  getUserStats,
};
