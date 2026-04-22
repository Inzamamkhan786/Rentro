const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Storage configuration for multer.
 * In production, use Cloudinary or S3 instead.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter for image uploads.
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
  }
};

/**
 * File filter for document uploads (images + PDF).
 */
const documentFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_DOC_TYPES.join(', ')}`), false);
  }
};

/**
 * Upload middleware for vehicle images (multiple).
 */
const uploadVehicleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('images', 10);

/**
 * Upload middleware for document files (single).
 */
const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('document');

/**
 * Upload middleware for avatar (single).
 */
const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('avatar');

module.exports = {
  uploadVehicleImages,
  uploadDocument,
  uploadAvatar,
  imageFilter,
  documentFilter,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  MAX_FILE_SIZE,
};
