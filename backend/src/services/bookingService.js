const dayjs = require('dayjs');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const BookingHistory = require('../models/BookingHistory');
const { BOOKING_STATUS, ROLES } = require('../utils/constants');
const { getPriorityHierarchy, getSetting } = require('./settingsService');
const { toSafeObjectId, toSafeString } = require('../utils/sanitize');

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const hasTimeOverlap = (startA, endA, startB, endB) =>
  toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);

const getConflictingBooking = async ({ resourceId, date, startTime, endTime }) =>
  Booking.findOne({
    resourceId: toSafeObjectId(resourceId),
    date: toSafeString(date, { maxLength: 10, pattern: /^\d{4}-\d{2}-\d{2}$/ }),
    startTime: { $lt: toSafeString(endTime, { maxLength: 5, pattern: /^\d{2}:\d{2}$/ }) },
    endTime: { $gt: toSafeString(startTime, { maxLength: 5, pattern: /^\d{2}:\d{2}$/ }) },
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
  }).lean();

const isConflict = (existingBooking, newStart, newEnd) =>
  existingBooking && hasTimeOverlap(existingBooking.startTime, existingBooking.endTime, newStart, newEnd);

const canOverrideRole = (role) => [ROLES.CHAIRMAN, ROLES.PRINCIPAL, ROLES.SUPER_ADMIN].includes(role);

const shouldRequireApproval = async (resourceType) => {
  if (resourceType === 'Auditorium') {
    return getSetting('auditoriumApprovalRequired', true);
  }
  return getSetting('meetingRoomApprovalRequired', false);
};

const suggestAlternativeResources = async ({ resourceType, attendeesCount, excludeResourceId }) => {
  const query = {
    type: resourceType,
    status: 'Active',
    capacity: { $gte: attendeesCount },
  };

  if (excludeResourceId) {
    query._id = { $ne: excludeResourceId };
  }

  return Resource.find(query).sort({ capacity: 1 }).limit(3).lean();
};

const createBookingHistory = async (bookingId, action, actorId, oldValue, newValue, reason) =>
  BookingHistory.create({ bookingId, action, actorId, oldValue, newValue, reason });

const getApprovalStatus = async (resource) => {
  const requiresApproval = await shouldRequireApproval(resource.type);
  return requiresApproval ? BOOKING_STATUS.PENDING : BOOKING_STATUS.APPROVED;
};

const getPriorityValue = async (role) => {
  const hierarchy = await getPriorityHierarchy();
  return hierarchy[role] ?? 999;
};

const getNoShowCutoff = async (booking) => {
  const checkInWindowMinutes = await getSetting('checkInWindowMinutes', 15);
  return dayjs(`${booking.date} ${booking.startTime}`).add(checkInWindowMinutes, 'minute');
};

module.exports = {
  getConflictingBooking,
  isConflict,
  canOverrideRole,
  suggestAlternativeResources,
  createBookingHistory,
  getApprovalStatus,
  getPriorityValue,
  getNoShowCutoff,
  hasTimeOverlap,
};
