/**
 * tools/document.tool.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SCHEMA + HANDLER for admin document verification:
 *   • list_pending_documents — list all docs awaiting admin review
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Document, User } = require('../../../models');

// ─── Tool Schema ──────────────────────────────────────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'list_pending_documents',
      description:
        'For admin users: retrieve all documents pending verification. ' +
        'Ordered oldest-first so the admin clears the backlog in sequence. ' +
        'Returns type, uploader details, file URL, submission date, and expiry.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['DL', 'RC', 'PUC', 'Aadhar', 'PAN', 'VoterID', 'RationCard'],
            description: 'Optional: filter by a specific document type',
          },
        },
        required: [],
      },
    },
  },
];

// ─── Handler ──────────────────────────────────────────────────────────────────
const handlers = {

  async list_pending_documents({ type }) {
    try {
      const where = { status: 'pending' };
      if (type) where.type = type;

      const docs = await Document.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
        order: [['created_at', 'ASC']],
        limit: 20,
      });

      if (!docs.length) {
        return JSON.stringify({
          found: false,
          message: type
            ? `No pending ${type} documents found.`
            : '✅ No documents pending — verification queue is clear!',
        });
      }

      return JSON.stringify({
        found: true,
        count: docs.length,
        documents: docs.map((d) => ({
          documentId:    d.id,
          type:          d.type,
          status:        d.status,
          uploaderName:  d.user?.name,
          uploaderEmail: d.user?.email,
          uploaderRole:  d.user?.role,
          fileUrl:       d.fileUrl,
          vehicleId:     d.vehicleId,
          submittedAt:   d.createdAt,
          expiryDate:    d.expiryDate,
        })),
      });
    } catch (err) {
      return JSON.stringify({ error: err.message });
    }
  },

};

module.exports = { tools, handlers };
