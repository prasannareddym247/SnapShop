const crypto = require('crypto');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const PEPPER = process.env.OTP_PEPPER || 'snapshop-otp-pepper-dev';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  return crypto.createHmac('sha256', PEPPER).update(otp).digest('hex');
}

function verifyOtp(otp, hash) {
  const computed = crypto.createHmac('sha256', PEPPER).update(otp).digest('hex');
  if (computed.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

function isOtpExpired(expiry) {
  return !expiry || new Date() > new Date(expiry);
}

function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

function isWithinCooldown(lastSentAt) {
  if (!lastSentAt) return false;
  return (Date.now() - new Date(lastSentAt).getTime()) < OTP_COOLDOWN_SECONDS * 1000;
}

function getCooldownRemaining(lastSentAt) {
  if (!lastSentAt) return 0;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  return Math.max(0, OTP_COOLDOWN_SECONDS - Math.floor(elapsed / 1000));
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp,
  isOtpExpired,
  getOtpExpiry,
  isWithinCooldown,
  getCooldownRemaining,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  OTP_COOLDOWN_SECONDS,
  MAX_OTP_ATTEMPTS
};
