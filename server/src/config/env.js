const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'rentora',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  isProduction: () => env.nodeEnv === 'production',
  isTest: () => env.nodeEnv === 'test',
  isDevelopment: () => env.nodeEnv === 'development',
};

module.exports = env;
