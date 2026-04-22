const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

// All admin routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.put('/vehicles/:id/approve', adminController.approveVehicle);
router.delete('/vehicles/:id', adminController.removeVehicle);
router.get('/verifications', adminController.getPendingVerifications);
router.get('/revenue', adminController.getRevenueReport);

module.exports = router;
