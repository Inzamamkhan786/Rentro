/**
 * tools/support.tool.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SCHEMA + HANDLER for support ticket submission:
 *   • submit_support_ticket — available to consumers and providers
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { SupportTicket, User } = require('../../../models');

// ─── Tool Schema ──────────────────────────────────────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'submit_support_ticket',
      description:
        'Submit a support ticket to the Rentora admin team. ' +
        'Available to both consumers and providers. ' +
        "AI auto-generates a professional subject + description — always show the draft to the user for confirmation first.",
      parameters: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Concise subject, e.g. "Booking #12 Not Confirmed After Payment"',
          },
          description: {
            type: 'string',
            description:
              'Full issue details: user role, booking/vehicle IDs, what happened, what was expected, dates.',
          },
        },
        required: ['subject', 'description'],
      },
    },
  },
];

// ─── Handler ──────────────────────────────────────────────────────────────────
const handlers = {

  async submit_support_ticket({ subject, description }, userId) {
    try {
      const user = await User.findByPk(userId, { attributes: ['name', 'email', 'role'] });

      const ticket = await SupportTicket.create({
        userId,
        subject,
        description,
        senderName:  user?.name  || 'Unknown',
        senderEmail: user?.email || '',
        status: 'open',
      });

      return JSON.stringify({
        success:  true,
        ticketId: ticket.id,
        subject:  ticket.subject,
        status:   ticket.status,
        message:
          `✅ Support ticket #${ticket.id} submitted! ` +
          `Our admin team will respond to ${user?.email} shortly.`,
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: err.message });
    }
  },

};

module.exports = { tools, handlers };
