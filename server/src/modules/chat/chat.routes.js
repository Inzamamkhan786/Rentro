const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/:bookingId', chatController.getMessages);
router.post('/:bookingId', chatController.sendMessage);

module.exports = router;
