const app = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');

// Initialize models and associations
require('./models');

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚗 Rentora server running on port ${PORT}`);
      console.log(`📍 Environment: ${env.nodeEnv}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
