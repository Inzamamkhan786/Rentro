const express = require('express');
const router = express.Router();
const supportController = require('./support.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

router.use(authenticate);

router.post('/', supportController.createTicket);
router.get('/my', supportController.getMyTickets);

// Admin routes
router.get('/', authorize('admin'), supportController.getAllTickets);
router.put('/:id', authorize('admin'), supportController.replyToTicket);

module.exports = router;
