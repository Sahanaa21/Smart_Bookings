const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['Auditorium', 'Meeting Room'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    building: { type: String, required: true },
    floor: { type: String, default: '' },
    description: { type: String, default: '' },
    facilities: [{ type: String }],
    projectorAvailable: { type: Boolean, default: false },
    acAvailable: { type: Boolean, default: false },
    soundSystemAvailable: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Under Maintenance', 'Disabled'], default: 'Active' },
    sensorId: { type: String, default: '' },
    occupancyStatus: { type: String, default: 'Unknown' },
    occupancyCount: { type: Number, default: 0 },
    lastSensorUpdate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
