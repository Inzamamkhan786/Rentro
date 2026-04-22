const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/stats', authorize('admin'), userController.getUserStats);
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
