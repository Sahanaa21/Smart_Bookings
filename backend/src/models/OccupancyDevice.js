const mongoose = require('mongoose');

const occupancyDeviceSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    lastStatus: { type: String, default: 'Unknown' },
    lastCount: { type: Number, default: 0 },
    lastSensorUpdate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('OccupancyDevice', occupancyDeviceSchema);
