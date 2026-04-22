const { sequelize } = require('./config/db');
async function run() {
  try {
    await sequelize.query("ALTER TYPE enum_documents_type ADD VALUE 'Aadhar'");
    await sequelize.query("ALTER TYPE enum_documents_type ADD VALUE 'PAN'");
    await sequelize.query("ALTER TYPE enum_documents_type ADD VALUE 'VoterID'");
    console.log('success');
  } catch(e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
}
run();
