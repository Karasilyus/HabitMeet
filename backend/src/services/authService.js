const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { isValidNeighborhood, normalizeNeighborhood } = require('../constants/neighborhoods');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NEIGHBORHOOD = 'Admin';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeInput(str) {
  if (!str) return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

function validateRegisterInput({ name, email, password, neighborhood, neighborhoodDetail }) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !EMAIL_REGEX.test(email)) errors.push('Valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  const normalized = normalizeNeighborhood(neighborhood, neighborhoodDetail);
  if (!normalized || !isValidNeighborhood(normalized)) {
    errors.push('Geçerli bir semt seçin veya yakın semt bilgisi girin');
  }
  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email || !EMAIL_REGEX.test(email)) errors.push('Valid email is required');
  if (!password) errors.push('Password is required');
  return errors;
}

async function register({ name, email, password, neighborhood, neighborhoodDetail }) {
  const errors = validateRegisterInput({ name, email, password, neighborhood, neighborhoodDetail });
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  const neighborhoodValue = normalizeNeighborhood(neighborhood, neighborhoodDetail);

  const existing = await userModel.findByEmail(email.toLowerCase());
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    name: sanitizeInput(name.trim()),
    email: email.toLowerCase().trim(),
    password: hashed,
    neighborhood: neighborhoodValue,
  });

  const token = generateToken(user);
  return { user, token };
}

async function login({ email, password }) {
  const errors = validateLoginInput({ email, password });
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.status = 400;
    throw err;
  }

  const emailLower = email.toLowerCase();
  let user = await userModel.findByEmail(emailLower);

  if (!user) {
    if (emailLower === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const hashed = await bcrypt.hash(password, 10);
      user = await userModel.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: hashed,
        neighborhood: ADMIN_NEIGHBORHOOD,
      });
    } else {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      neighborhood: user.neighborhood,
      created_at: user.created_at,
      isAdmin: user.email.toLowerCase() === ADMIN_EMAIL,
    },
    token,
  };
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.email.toLowerCase() === ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  register,
  login,
  validateRegisterInput,
  validateLoginInput,
};
