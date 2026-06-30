const express = require('express');
const { chat } = require('./agent.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

// All agent chat endpoints require the user to be logged in
router.use(authenticate);

router.post('/chat', chat);

module.exports = router;
