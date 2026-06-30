const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const ApiError = require('../utils/ApiError');

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Allowed Types ────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES   = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
const MAX_FILE_SIZE       = 5 * 1024 * 1024; // 5MB

// ─── Memory Storage (buffer, no disk) ────────────────────────────────────────
const memStorage = multer.memoryStorage();

// ─── File Filters ─────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type. Allowed: jpg, png, webp`), false);
  }
};

const documentFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type. Allowed: jpg, png, webp, pdf`), false);
  }
};

// ─── Upload Middlewares (buffer to memory) ────────────────────────────────────
const uploadVehicleImages = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('images', 10);

const uploadDocument = multer({
  storage: memStorage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('document');

const uploadAvatar = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('avatar');

// ─── Helper: Upload single buffer to Cloudinary ───────────────────────────────
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─── Middleware: auto-upload files to Cloudinary after multer ─────────────────

/**
 * After uploadVehicleImages runs, this uploads each buffer to Cloudinary
 * and replaces req.files with Cloudinary result objects.
 */
const processVehicleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();
    const uploads = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, 'rentora/vehicles', 'image'))
    );
    req.cloudinaryFiles = uploads; // array of Cloudinary results
    next();
  } catch (err) {
    next(ApiError.internal('Image upload failed: ' + err.message));
  }
};

/**
 * After uploadDocument runs, uploads the single buffer to Cloudinary.
 */
const processDocument = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const result = await uploadToCloudinary(req.file.buffer, 'rentora/documents', resourceType);
    req.cloudinaryFile = result;
    next();
  } catch (err) {
    next(ApiError.internal('Document upload failed: ' + err.message));
  }
};

/**
 * After uploadAvatar runs, uploads the single buffer to Cloudinary.
 */
const processAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const result = await uploadToCloudinary(req.file.buffer, 'rentora/avatars', 'image');
    req.cloudinaryFile = result;
    next();
  } catch (err) {
    next(ApiError.internal('Avatar upload failed: ' + err.message));
  }
};

module.exports = {
  cloudinary,
  uploadVehicleImages,
  uploadDocument,
  uploadAvatar,
  processVehicleImages,
  processDocument,
  processAvatar,
  uploadToCloudinary,
  imageFilter,
  documentFilter,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  MAX_FILE_SIZE,
};
