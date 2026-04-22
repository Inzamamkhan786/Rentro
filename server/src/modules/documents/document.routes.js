const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { uploadDocumentSchema, verifyDocumentSchema } = require('./document.validation');
const { uploadDocument } = require('../../middleware/upload.middleware');

router.use(authenticate);

router.post('/', uploadDocument, validate(uploadDocumentSchema), documentController.uploadDocument);
router.get('/my', documentController.getMyDocuments);
router.get('/pending', authorize('admin'), documentController.getPendingDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/:id/expiry', documentController.checkDocumentExpiry);
router.post('/:id/validate', documentController.validateDocument);
router.put('/:id/verify', authorize('admin'), validate(verifyDocumentSchema), documentController.verifyDocument);

module.exports = router;
