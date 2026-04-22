const { Document, User, Vehicle } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { extractDLData, extractRCData, extractPUCData, validateExtractedDL, validateExtractedRC, validateExtractedPUC } = require('../../utils/ocr');
const { getPagination } = require('../../utils/helpers');

/**
 * Upload a document for verification.
 * @param {number} userId
 * @param {Object} docData - { type, fileUrl, vehicleId }
 * @returns {Promise<Object>}
 */
const uploadDocument = async (userId, docData) => {
  const { type, fileUrl, vehicleId } = docData;

  // Validate user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // If it's a vehicle document, validate vehicle exists and belongs to user
  if (vehicleId) {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }
    if (vehicle.ownerId !== userId) {
      throw ApiError.forbidden('Vehicle does not belong to you');
    }
  }

  // Check for existing pending/verified document of same type
  const existingDoc = await Document.findOne({
    where: {
      userId,
      type,
      status: ['pending', 'verified'],
      ...(vehicleId ? { vehicleId } : {}),
    },
  });

  if (existingDoc) {
    if (existingDoc.status === 'verified') {
      throw ApiError.conflict(`A verified ${type} document already exists`);
    }
    if (existingDoc.status === 'pending') {
      throw ApiError.conflict(`A ${type} document is already pending verification`);
    }
  }

  // Run OCR extraction
  let extractedData = {};
  try {
    switch (type) {
    case 'DL':
      extractedData = await extractDLData(fileUrl);
      break;
    case 'RC':
      extractedData = await extractRCData(fileUrl);
      break;
    case 'PUC':
      extractedData = await extractPUCData(fileUrl);
      break;
    }
  } catch {
    // OCR failed, continue with empty data (admin will verify manually)
    extractedData = { error: 'OCR extraction failed' };
  }

  const document = await Document.create({
    userId,
    vehicleId: vehicleId || null,
    type,
    fileUrl,
    extractedData,
    status: 'pending',
    expiryDate: extractedData.expiryDate ? new Date(extractedData.expiryDate) : null,
  });

  return document;
};

/**
 * Get document by ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
const getDocumentById = async (id) => {
  const document = await Document.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'verifiedBy', attributes: ['id', 'name'] },
    ],
  });

  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  return document;
};

/**
 * Get documents for a user.
 * @param {number} userId
 * @returns {Promise<Array>}
 */
const getUserDocuments = async (userId) => {
  return Document.findAll({
    where: { userId },
    order: [['created_at', 'DESC']],
  });
};

/**
 * Admin: Verify or reject a document.
 * @param {number} docId
 * @param {number} adminId
 * @param {string} status - 'verified' or 'rejected'
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>}
 */
const verifyDocument = async (docId, adminId, status, reason) => {
  const document = await Document.findByPk(docId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  if (document.status !== 'pending') {
    throw ApiError.badRequest(`Document is already ${document.status}`);
  }

  if (!['verified', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Status must be verified or rejected');
  }

  const updateData = {
    status,
    verifiedById: adminId,
  };

  if (status === 'rejected') {
    if (!reason) {
      throw ApiError.badRequest('Rejection reason is required');
    }
    updateData.rejectionReason = reason;
  }

  await document.update(updateData);

  // If DL is verified, update user verified status
  if (status === 'verified' && document.type === 'DL') {
    await User.update({ verified: true }, { where: { id: document.userId } });
  }

  // If RC/PUC is verified, check if all vehicle docs are verified
  if (status === 'verified' && ['RC', 'PUC'].includes(document.type) && document.vehicleId) {
    const vehicleDocs = await Document.findAll({
      where: {
        vehicleId: document.vehicleId,
        type: { $in: ['RC', 'PUC'] },
      },
    });

    const allVerified = vehicleDocs.length >= 2 &&
      vehicleDocs.every((d) => d.status === 'verified');

    if (allVerified) {
      await Vehicle.update({ verified: true }, { where: { id: document.vehicleId } });
    }
  }

  return document;
};

/**
 * Validate document data based on type.
 * @param {string} type
 * @param {Object} extractedData
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateDocumentData = (type, extractedData) => {
  switch (type) {
  case 'DL':
    return validateExtractedDL(extractedData);
  case 'RC':
    return validateExtractedRC(extractedData);
  case 'PUC':
    return validateExtractedPUC(extractedData);
  default:
    return { isValid: false, errors: ['Unknown document type'] };
  }
};

/**
 * Check if a document has expired.
 * @param {number} docId
 * @returns {Promise<{ expired: boolean, expiryDate: Date }>}
 */
const checkDocumentExpiry = async (docId) => {
  const document = await Document.findByPk(docId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  if (!document.expiryDate) {
    return { expired: false, expiryDate: null, message: 'No expiry date set' };
  }

  const expired = new Date(document.expiryDate) < new Date();
  return {
    expired,
    expiryDate: document.expiryDate,
    message: expired ? 'Document has expired' : 'Document is valid',
  };
};

/**
 * Get all pending documents for admin review.
 * @param {Object} query
 * @returns {Promise<Object>}
 */
const getPendingDocuments = async (query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Document.findAndCountAll({
    where: { status: 'pending' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
    limit,
    offset,
    order: [['created_at', 'ASC']],
  });

  return { documents: rows, total: count, page, limit };
};

module.exports = {
  uploadDocument,
  getDocumentById,
  getUserDocuments,
  verifyDocument,
  validateDocumentData,
  checkDocumentExpiry,
  getPendingDocuments,
};
