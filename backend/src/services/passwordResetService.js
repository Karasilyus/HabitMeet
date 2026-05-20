const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const passwordResetModel = require('../models/passwordResetModel');
const { sendPasswordResetEmail } = require('./emailService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 1;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildResetUrl(token) {
  const base = (process.env.FRONTEND_URL || 'http://localhost:5500').replace(/\/$/, '');
  return `${base}/#/reset-password?token=${encodeURIComponent(token)}`;
}

function getExpiryIso() {
  const d = new Date();
  d.setHours(d.getHours() + EXPIRY_HOURS);
  return d.toISOString();
}

async function requestReset(emailInput) {
  const email = (emailInput || '').toLowerCase().trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    const err = new Error('Geçerli bir e-posta adresi girin');
    err.status = 400;
    throw err;
  }

  const user = await userModel.findByEmail(email);
  const genericMessage =
    'Bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.';

  if (!user) {
    return { message: genericMessage };
  }

  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = getExpiryIso();

  await passwordResetModel.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = buildResetUrl(token);
  const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

  const response = { message: genericMessage };

  const showDevLink =
    process.env.DEV_SHOW_RESET_LINK === 'true' ||
    (process.env.NODE_ENV !== 'production' && !emailResult.sent);

  if (showDevLink) {
    response.devResetUrl = resetUrl;
    response.devNote =
      'Geliştirme modu: E-posta gönderilmedi. Aşağıdaki bağlantıyı kullanarak şifrenizi sıfırlayabilirsiniz.';
  }

  return response;
}

async function resetPassword(token, newPassword) {
  if (!token || token.length < 20) {
    const err = new Error('Geçersiz veya süresi dolmuş sıfırlama bağlantısı');
    err.status = 400;
    throw err;
  }
  if (!newPassword || newPassword.length < 6) {
    const err = new Error('Yeni şifre en az 6 karakter olmalı');
    err.status = 400;
    throw err;
  }

  const tokenHash = hashToken(token);
  const record = await passwordResetModel.findValidByHash(tokenHash);

  if (!record) {
    const err = new Error('Geçersiz veya süresi dolmuş sıfırlama bağlantısı');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(record.user_id, hashed);
  await passwordResetModel.markUsed(record.id);

  return { message: 'Şifreniz güncellendi. Giriş yapabilirsiniz.' };
}

module.exports = { requestReset, resetPassword };
