const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'vehicle_id',
    references: {
      model: 'vehicles',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('DL', 'RC', 'PUC', 'Aadhar', 'PAN', 'VoterID', 'RationCard'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['DL', 'RC', 'PUC', 'Aadhar', 'PAN', 'VoterID', 'RationCard']],
        msg: 'Document type must be DL, RC, PUC, Aadhar, PAN, VoterID, or RationCard',
      },
    },
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url',
    validate: {
      notEmpty: { msg: 'File URL is required' },
    },
  },
  extractedData: {
    type: DataTypes.JSON,
    defaultValue: {},
    field: 'extracted_data',
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expiry_date',
  },
  verifiedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'verified_by_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rejectionReason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'rejection_reason',
  },
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true,
});

module.exports = Document;
