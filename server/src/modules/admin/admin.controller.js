const adminService = require('./admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json(ApiResponse.ok(stats));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  res.status(200).json(ApiResponse.paginated(result.users, result.page, result.limit, result.total));
});

const banUser = asyncHandler(async (req, res) => {
  const user = await adminService.banUser(parseInt(req.params.id, 10), req.body.reason);
  res.status(200).json(ApiResponse.ok(user, 'User banned'));
});

const unbanUser = asyncHandler(async (req, res) => {
  const user = await adminService.unbanUser(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(user, 'User unbanned'));
});

const approveVehicle = asyncHandler(async (req, res) => {
  const vehicle = await adminService.approveVehicle(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(vehicle, 'Vehicle approved'));
});

const removeVehicle = asyncHandler(async (req, res) => {
  await adminService.removeVehicle(parseInt(req.params.id, 10), req.body.reason);
  res.status(200).json(ApiResponse.ok(null, 'Vehicle removed'));
});

const getPendingVerifications = asyncHandler(async (req, res) => {
  const result = await adminService.getPendingVerifications(req.query);
  res.status(200).json(ApiResponse.paginated(result.documents, result.page, result.limit, result.total));
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const report = await adminService.getRevenueReport({
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });
  res.status(200).json(ApiResponse.ok(report));
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  banUser,
  unbanUser,
  approveVehicle,
  removeVehicle,
  getPendingVerifications,
  getRevenueReport,
};
