const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');
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

// ─── Cloudinary Storage Configs ───────────────────────────────────────────────
const vehicleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'rentora/vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'rentora/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    resource_type:   file.mimetype === 'application/pdf' ? 'raw' : 'image',
  }),
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'rentora/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: jpg, png, webp`), false);
  }
};

const documentFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: jpg, png, webp, pdf`), false);
  }
};

// ─── Upload Middlewares ───────────────────────────────────────────────────────
const uploadVehicleImages = multer({
  storage: vehicleStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('images', 10);

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('document');

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('avatar');

module.exports = {
  cloudinary,
  uploadVehicleImages,
  uploadDocument,
  uploadAvatar,
  imageFilter,
  documentFilter,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  MAX_FILE_SIZE,
};
