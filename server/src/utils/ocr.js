/**
 * Mock OCR extraction module for document verification.
 * In production, this would integrate with Tesseract.js, Google Vision API,
 * or a similar OCR service.
 */

/**
 * Extract data from a Driving License document.
 * @param {string} fileUrl - Path/URL to the DL image
 * @returns {Promise<Object>} Extracted DL data
 */
const extractDLData = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error('File URL is required for OCR extraction');
  }

  // Simulate OCR processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // In production, this would call an OCR API
  return {
    name: 'Extracted Name',
    dlNumber: 'MH12 20190000001',
    dateOfBirth: '1995-01-15',
    issueDate: '2019-06-01',
    expiryDate: '2039-06-01',
    address: 'Extracted Address, City, State',
    vehicleClass: ['LMV', 'MCWG'],
    bloodGroup: 'O+',
    confidence: 0.85,
  };
};

/**
 * Extract data from a Registration Certificate (RC).
 * @param {string} fileUrl - Path/URL to the RC image
 * @returns {Promise<Object>} Extracted RC data
 */
const extractRCData = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error('File URL is required for OCR extraction');
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    registrationNumber: 'MH 12 AB 1234',
    ownerName: 'Extracted Owner Name',
    vehicleClass: 'LMV',
    fuelType: 'Petrol',
    makerModel: 'Maruti Suzuki Swift',
    registrationDate: '2020-03-15',
    expiryDate: '2035-03-15',
    engineNumber: 'ENG123456789',
    chassisNumber: 'CHS987654321',
    confidence: 0.88,
  };
};

/**
 * Extract data from a Pollution Under Control (PUC) certificate.
 * @param {string} fileUrl - Path/URL to the PUC image
 * @returns {Promise<Object>} Extracted PUC data
 */
const extractPUCData = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error('File URL is required for OCR extraction');
  }

  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    vehicleNumber: 'MH 12 AB 1234',
    testDate: '2024-01-15',
    expiryDate: '2024-07-15',
    result: 'PASS',
    centerName: 'Authorized PUC Center',
    certificateNumber: 'PUC2024001234',
    confidence: 0.82,
  };
};

/**
 * Validate extracted DL data.
 * @param {Object} data - Extracted DL data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateExtractedDL = (data) => {
  const errors = [];

  if (!data) {
    return { isValid: false, errors: ['No data provided'] };
  }

  if (!data.dlNumber) {
    errors.push('DL number not found');
  }

  if (!data.name) {
    errors.push('Name not found');
  }

  if (!data.expiryDate) {
    errors.push('Expiry date not found');
  } else if (new Date(data.expiryDate) < new Date()) {
    errors.push('Driving license has expired');
  }

  if (data.confidence !== undefined && data.confidence < 0.7) {
    errors.push('Low OCR confidence, manual review required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate extracted RC data.
 * @param {Object} data - Extracted RC data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateExtractedRC = (data) => {
  const errors = [];

  if (!data) {
    return { isValid: false, errors: ['No data provided'] };
  }

  if (!data.registrationNumber) {
    errors.push('Registration number not found');
  }

  if (!data.ownerName) {
    errors.push('Owner name not found');
  }

  if (!data.expiryDate) {
    errors.push('Expiry date not found');
  } else if (new Date(data.expiryDate) < new Date()) {
    errors.push('Registration certificate has expired');
  }

  if (data.confidence !== undefined && data.confidence < 0.7) {
    errors.push('Low OCR confidence, manual review required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate extracted PUC data.
 * @param {Object} data - Extracted PUC data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateExtractedPUC = (data) => {
  const errors = [];

  if (!data) {
    return { isValid: false, errors: ['No data provided'] };
  }

  if (!data.vehicleNumber) {
    errors.push('Vehicle number not found');
  }

  if (!data.expiryDate) {
    errors.push('Expiry date not found');
  } else if (new Date(data.expiryDate) < new Date()) {
    errors.push('PUC certificate has expired');
  }

  if (data.result && data.result !== 'PASS') {
    errors.push('Vehicle did not pass pollution test');
  }

  if (data.confidence !== undefined && data.confidence < 0.7) {
    errors.push('Low OCR confidence, manual review required');
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  extractDLData,
  extractRCData,
  extractPUCData,
  validateExtractedDL,
  validateExtractedRC,
  validateExtractedPUC,
};
