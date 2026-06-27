const mongoose = require('mongoose');

const toSafeString = (value, { maxLength = 100, pattern } = {}) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return '';
  if (pattern && !pattern.test(trimmed)) return '';
  return trimmed;
};

const toSafeObjectId = (value) => {
  if (typeof value !== 'string') return null;
  return mongoose.isValidObjectId(value) ? value : null;
};

module.exports = { toSafeString, toSafeObjectId };
