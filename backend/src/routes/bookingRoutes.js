const express = require('express');
const { body, query } = require('express-validator');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { BOOKING_STATUS, ROLES } = require('../utils/constants');
const {
  getConflictingBooking,
  isConflict,
  canOverrideRole,
  suggestAlternativeResources,
  createBookingHistory,
  getApprovalStatus,
  getPriorityValue,
  hasTimeOverlap,
} = require('../services/bookingService');
const { createNotification } = require('../services/notificationService');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(auth);

router.get(
  '/availability',
  [query('date').notEmpty(), query('startTime').notEmpty(), query('endTime').notEmpty(), query('attendeesCount').isInt({ min: 1 })],
  validate,
  async (req, res) => {
    const { date, startTime, endTime } = req.query;
    const attendeesCount = Number(req.query.attendeesCount);

    const activeResources = await Resource.find({ status: 'Active', capacity: { $gte: attendeesCount } }).lean();
    const booked = await Booking.find({
      date,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
    }).lean();

    const availableResources = [];
    const unavailableResources = [];

    activeResources.forEach((resource) => {
      const conflict = booked.find(
        (booking) =>
          String(booking.resourceId) === String(resource._id) &&
          hasTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
      );

      if (conflict) {
        unavailableResources.push({ resource, conflictBookingId: conflict._id });
      } else {
        availableResources.push(resource);
      }
    });

    availableResources.sort((a, b) => a.capacity - b.capacity);

    return res.json({
      availableResources,
      unavailableResources,
      suggestions: availableResources.slice(0, 3),
    });
  }
);

router.get('/', async (req, res) => {
  const { date, status, resourceId } = req.query;
  const queryFilter = {};
  if (date) queryFilter.date = date;
  if (status) queryFilter.status = status;
  if (resourceId) queryFilter.resourceId = resourceId;

  const bookings = await Booking.find(queryFilter)
    .populate('resourceId', 'name type capacity status')
    .populate('userId', 'name employeeId role department')
    .sort({ date: 1, startTime: 1 })
    .lean();

  return res.json(bookings);
});

router.post(
  '/',
  [
    body('resourceId').notEmpty(),
    body('date').notEmpty(),
    body('startTime').notEmpty(),
    body('endTime').notEmpty(),
    body('attendeesCount').isInt({ min: 1 }),
    body('purpose').notEmpty(),
  ],
  validate,
  async (req, res) => {
    const resource = await Resource.findById(req.body.resourceId).lean();
    if (!resource || resource.status !== 'Active') {
      return res.status(400).json({ message: 'Selected resource is unavailable' });
    }
    if (req.body.attendeesCount > resource.capacity) {
      return res.status(400).json({ message: 'Attendees exceed resource capacity' });
    }

    const conflicting = await getConflictingBooking(req.body);

    if (isConflict(conflicting, req.body.startTime, req.body.endTime)) {
      const existingBookingUser = await User.findById(conflicting.userId).lean();
      const currentPriority = await getPriorityValue(req.user.role);
      const existingPriority = await getPriorityValue(existingBookingUser?.role);

      if (!(currentPriority < existingPriority && canOverrideRole(req.user.role))) {
        const alternatives = await suggestAlternativeResources({
          resourceType: resource.type,
          attendeesCount: req.body.attendeesCount,
          excludeResourceId: resource._id,
        });
        return res.status(409).json({ message: 'Time slot already booked', alternatives });
      }

      if (!req.body.overrideReason) {
        return res.status(400).json({ message: 'Override reason is mandatory' });
      }

      await Booking.findByIdAndUpdate(conflicting._id, {
        status: BOOKING_STATUS.OVERRIDDEN,
        overriddenBy: req.user._id,
        overrideReason: req.body.overrideReason,
      });

      await createNotification({
        userId: conflicting.userId,
        title: 'Booking overridden',
        message: `Your booking for ${resource.name} was overridden. Reason: ${req.body.overrideReason}`,
      });

      await createBookingHistory(
        conflicting._id,
        'Booking Override',
        req.user._id,
        { status: conflicting.status },
        { status: BOOKING_STATUS.OVERRIDDEN },
        req.body.overrideReason
      );
    }

    const status = await getApprovalStatus(resource);
    const booking = await Booking.create({
      ...req.body,
      userId: req.user._id,
      department: req.user.department,
      status,
      requiresApproval: status === BOOKING_STATUS.PENDING,
    });

    await createBookingHistory(booking._id, 'Booking Creation', req.user._id, null, booking);
    await logAudit({ user: req.user, action: 'Booking Creation', resource: 'Booking', newValue: booking, ipAddress: req.ip });

    return res.status(201).json(booking);
  }
);

router.patch(
  '/:id/status',
  allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN),
  [body('status').isIn(Object.values(BOOKING_STATUS))],
  validate,
  async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const oldValue = { status: booking.status };
    booking.status = req.body.status;
    booking.approvedBy = req.user._id;
    if (req.body.status === BOOKING_STATUS.REJECTED) {
      booking.rejectedReason = req.body.reason || 'Rejected by admin';
    }
    await booking.save();

    await createBookingHistory(booking._id, `Booking ${req.body.status}`, req.user._id, oldValue, { status: booking.status }, req.body.reason);
    await createNotification({
      userId: booking.userId,
      title: `Booking ${booking.status}`,
      message: `Your booking is now ${booking.status}`,
    });

    await logAudit({
      user: req.user,
      action: `Booking ${req.body.status}`,
      resource: 'Booking',
      oldValue,
      newValue: { status: booking.status },
      ipAddress: req.ip,
    });

    return res.json(booking);
  }
);

router.post('/:id/check-in', async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.userId) !== String(req.user._id) && req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Only booking owner can check in' });
  }

  booking.checkInAt = new Date();
  if (booking.status === BOOKING_STATUS.PENDING) {
    booking.status = BOOKING_STATUS.APPROVED;
  }
  await booking.save();
  await createBookingHistory(booking._id, 'Booking Check-In', req.user._id, null, { checkInAt: booking.checkInAt });
  return res.json({ message: 'Checked in', booking });
});

module.exports = router;
