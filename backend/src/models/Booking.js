const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../utils/constants');

const bookingSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    department: { type: String, default: '' },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    attendeesCount: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true },
    facilitiesRequired: [{ type: String }],
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING, index: true },
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedReason: String,
    overrideReason: String,
    overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    overriddenBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    checkInAt: Date,
    noShowCancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
