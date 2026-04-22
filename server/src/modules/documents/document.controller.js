const documentService = require('./document.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/documents
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
  const payload = { ...req.body, fileUrl };
  const document = await documentService.uploadDocument(req.userId, payload);
  res.status(201).json(ApiResponse.created(document));
});

/**
 * GET /api/documents/:id
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(document));
});

/**
 * GET /api/documents/my
 */
const getMyDocuments = asyncHandler(async (req, res) => {
  const documents = await documentService.getUserDocuments(req.userId);
  res.status(200).json(ApiResponse.ok(documents));
});

/**
 * PUT /api/documents/:id/verify
 */
const verifyDocument = asyncHandler(async (req, res) => {
  const document = await documentService.verifyDocument(
    parseInt(req.params.id, 10),
    req.userId,
    req.body.status,
    req.body.reason
  );
  res.status(200).json(ApiResponse.ok(document, `Document ${req.body.status}`));
});

/**
 * GET /api/documents/:id/expiry
 */
const checkDocumentExpiry = asyncHandler(async (req, res) => {
  const result = await documentService.checkDocumentExpiry(parseInt(req.params.id, 10));
  res.status(200).json(ApiResponse.ok(result));
});

/**
 * GET /api/documents/pending
 */
const getPendingDocuments = asyncHandler(async (req, res) => {
  const result = await documentService.getPendingDocuments(req.query);
  res.status(200).json(ApiResponse.paginated(result.documents, result.page, result.limit, result.total));
});

/**
 * POST /api/documents/:id/validate
 */
const validateDocument = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(parseInt(req.params.id, 10));
  const validation = documentService.validateDocumentData(document.type, document.extractedData);
  res.status(200).json(ApiResponse.ok(validation));
});

module.exports = {
  uploadDocument,
  getDocumentById,
  getMyDocuments,
  verifyDocument,
  checkDocumentExpiry,
  getPendingDocuments,
  validateDocument,
};
