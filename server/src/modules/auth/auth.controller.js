const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.created(result, 'Registration successful'));
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(ApiResponse.ok(result, 'Login successful'));
});

/**
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.userId);
  res.status(200).json(ApiResponse.ok(user, 'Profile retrieved'));
});

/**
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await authService.changePassword(req.userId, oldPassword, newPassword);
  res.status(200).json(ApiResponse.ok(user, 'Password changed successfully'));
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // Server-side session invalidation can be added here if needed
  res.status(200).json(ApiResponse.ok(null, 'Logout successful'));
});

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  logout,
};
