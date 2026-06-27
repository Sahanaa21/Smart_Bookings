const mongoose = require('mongoose');
const { DEFAULT_PRIORITY } = require('../utils/constants');

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

systemSettingSchema.statics.ensureDefaults = async function ensureDefaults() {
  const defaults = [
    { key: 'priorityHierarchy', value: DEFAULT_PRIORITY },
    { key: 'auditoriumApprovalRequired', value: true },
    { key: 'meetingRoomApprovalRequired', value: false },
    { key: 'overrideGracePeriodMinutes', value: 10 },
    { key: 'checkInWindowMinutes', value: 15 },
  ];

  await Promise.all(
    defaults.map((item) =>
      this.updateOne({ key: item.key }, { $setOnInsert: item }, { upsert: true })
    )
  );
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
