/**
 * Run this script ONCE to create an admin user.
 * Usage: node src/seed-admin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { sequelize } = require('./config/db');
const { User }      = require('./models');
const bcrypt        = require('bcryptjs');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const email    = 'admin@rentora.com';
    const password = 'Admin@123456';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      // Promote to admin if already exists
      await existing.update({ role: 'admin' });
      console.log(`✅ User ${email} promoted to admin`);
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({ name: 'Admin', email, password: hash, role: 'admin', verified: true });
      console.log(`✅ Admin user created: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
