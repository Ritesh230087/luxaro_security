const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate TOTP secret for 2FA
 * @param {String} email 
 * @returns {Object} 
 */
exports.generateSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `Luxaro (${email})`,
    issuer: 'Luxaro',
    length: 32
  });

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url
  };
};

/**
 * Verify TOTP token
 * @param {String} token 
 * @param {String} secret 
 * @returns {Boolean} 
 */
exports.verifyToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 
  });
};

/**
 * Generate backup codes
 * @param {Number} count - 
 * @returns {Array} - 
 */
exports.generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Verify backup code
 * @param {String} code 
 * @param {Array} backupCodes 
 * @returns {Boolean} 
 */
exports.verifyBackupCode = (code, backupCodes) => {
  const index = backupCodes.indexOf(code.toUpperCase());
  if (index > -1) {
    backupCodes.splice(index, 1); 
    return true;
  }
  return false;
};




