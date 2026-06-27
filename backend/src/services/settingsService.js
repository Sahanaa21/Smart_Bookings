const SystemSetting = require('../models/SystemSetting');
const { DEFAULT_PRIORITY } = require('../utils/constants');
const { toSafeString } = require('../utils/sanitize');

const getSetting = async (key, fallback) => {
  const safeKey = toSafeString(key, { maxLength: 60, pattern: /^[a-zA-Z][a-zA-Z0-9]*$/ });
  if (!safeKey) return fallback;
  const setting = await SystemSetting.findOne({ key: safeKey }).lean();
  return setting ? setting.value : fallback;
};

const setSetting = async (key, value) => {
  const safeKey = toSafeString(key, { maxLength: 60, pattern: /^[a-zA-Z][a-zA-Z0-9]*$/ });
  if (!safeKey) {
    throw new Error('Invalid setting key');
  }
  const setting = await SystemSetting.findOne({ key: safeKey });
  if (setting) {
    setting.value = value;
    await setting.save();
  } else {
    await SystemSetting.create({ key: safeKey, value });
  }
  return value;
};

const getPriorityHierarchy = async () => getSetting('priorityHierarchy', DEFAULT_PRIORITY);

module.exports = { getSetting, setSetting, getPriorityHierarchy };
