const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    department: String,
    totalBookings: { type: Number, default: 0 },
    totalNoShows: { type: Number, default: 0 },
    totalOverrides: { type: Number, default: 0 },
    peakHour: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
