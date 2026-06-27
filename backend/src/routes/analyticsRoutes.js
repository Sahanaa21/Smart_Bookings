const express = require('express');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { ROLES, BOOKING_STATUS } = require('../utils/constants');

const router = express.Router();
router.use(auth);

router.get('/summary', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN, ROLES.HOD), async (_req, res) => {
  const [totalResources, activeBookings, pendingRequests, noShows, overrides] = await Promise.all([
    Resource.countDocuments(),
    Booking.countDocuments({ status: BOOKING_STATUS.APPROVED }),
    Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ noShowCancelledAt: { $ne: null } }),
    Booking.countDocuments({ status: BOOKING_STATUS.OVERRIDDEN }),
  ]);

  return res.json({
    totalResources,
    activeBookings,
    pendingRequests,
    noShows,
    overrides,
  });
});

module.exports = router;
