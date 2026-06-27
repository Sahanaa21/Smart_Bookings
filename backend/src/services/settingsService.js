const SystemSetting = require('../models/SystemSetting');
const { DEFAULT_PRIORITY } = require('../utils/constants');

const getSetting = async (key, fallback) => {
  const setting = await SystemSetting.findOne({ key }).lean();
  return setting ? setting.value : fallback;
};

const setSetting = async (key, value) => {
  await SystemSetting.updateOne({ key }, { key, value }, { upsert: true });
  return value;
};

const getPriorityHierarchy = async () => getSetting('priorityHierarchy', DEFAULT_PRIORITY);

module.exports = { getSetting, setSetting, getPriorityHierarchy };
