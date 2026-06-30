/**
 * agent.controller.js
 * Handles HTTP requests for the AI Agent chat endpoint.
 */

const { processAgentChat } = require('./agent.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

/**
 * POST /api/agent/chat
 * Body: { messages: [{role, content}] }
 * Requires auth. Passes userId and userRole to the agent.
 */
const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'Messages array is required');
  }

  const userId = req.user.id;
  const userRole = req.user.role; // 'consumer', 'provider', 'admin'

  const reply = await processAgentChat(userId, userRole, messages);

  res.status(200).json({
    success: true,
    data: { reply },
  });
});

module.exports = { chat };
