const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const documentRoutes = require('./modules/documents/document.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const supportRoutes = require('./modules/support/support.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const agentRoutes = require('./modules/agent/agent.routes');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
// CORS — allow Vercel frontend + localhost dev
const allowedOrigins = [
  'https://rentro-tau.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rentora API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agent', agentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
