const activityTypeModel = require('../models/activityTypeModel');
const { containsForbiddenWords } = require('./contentFilter');

function normalizeTypeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ');
}

function validateTypeName(name) {
  if (name.length < 2) {
    const err = new Error('Tür adı en az 2 karakter olmalı');
    err.status = 400;
    throw err;
  }
  if (name.length > 80) {
    const err = new Error('Tür adı en fazla 80 karakter olabilir');
    err.status = 400;
    throw err;
  }
  if (containsForbiddenWords(name)) {
    const err = new Error('Tür adı uygunsuz kelime içeriyor');
    err.status = 400;
    throw err;
  }
}

async function listTypes() {
  return activityTypeModel.findAll();
}

async function createType(userId, nameInput) {
  const name = normalizeTypeName(nameInput);
  validateTypeName(name);

  const existing = await activityTypeModel.findByName(name);
  if (existing) {
    const err = new Error('Bu tür zaten mevcut');
    err.status = 409;
    throw err;
  }

  return activityTypeModel.create({ name, createdBy: userId });
}

async function findOrCreateType(userId, nameInput) {
  const name = normalizeTypeName(nameInput);
  validateTypeName(name);

  const existing = await activityTypeModel.findByName(name);
  if (existing) return existing;

  return activityTypeModel.create({ name, createdBy: userId });
}

async function resolveTypeId(userId, { type_id, type_name }) {
  if (type_id) {
    const type = await activityTypeModel.findById(type_id);
    if (!type) {
      const err = new Error('Seçilen tür bulunamadı');
      err.status = 404;
      throw err;
    }
    return type;
  }
  if (type_name) {
    return findOrCreateType(userId, type_name);
  }
  const err = new Error('Tür seçin veya yeni tür adı girin');
  err.status = 400;
  throw err;
}

module.exports = { listTypes, createType, findOrCreateType, resolveTypeId };
