const { Sequelize } = require('sequelize');
const env = require('./env');

let sequelize;

if (env.isTest()) {
  // Use SQLite in-memory for tests
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else {
  sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
    logging: env.isDevelopment() ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    if (env.isDevelopment() || env.isTest()) {
      await sequelize.sync({ alter: env.isDevelopment() });
      console.log('✅ Database models synced.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    if (!env.isTest()) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = { sequelize, connectDB };
