'use strict';

const crypto = require('crypto');

const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
};

const normalizeMobile = (mobile) => {
  if (!mobile) return null;
  const cleaned = String(mobile).replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  return cleaned.length >= 10 ? cleaned.slice(-10) : null;
};

const isValidMobile = (mobile) => {
  const normalized = normalizeMobile(mobile);
  return normalized !== null && /^[6-9]\d{9}$/.test(normalized);
};

const getOtpExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = {
  generateOtp,
  normalizeMobile,
  isValidMobile,
  getOtpExpiry,
};
