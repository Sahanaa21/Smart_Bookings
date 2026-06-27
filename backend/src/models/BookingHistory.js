const mongoose = require('mongoose');

const bookingHistorySchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    reason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingHistory', bookingHistorySchema);
