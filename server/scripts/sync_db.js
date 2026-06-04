require('dotenv').config({ path: '../.env' });
const { sequelize } = require('../src/config/db');
require('../src/models/index'); // Load associations

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Sync models
    // Using alter: true instead of force: true to prevent accidental data deletion
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to sync the database:', error);
    process.exit(1);
  }
}

syncDatabase();
