const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { registerSchema, loginSchema, changePasswordSchema } = require('./auth.validation');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
