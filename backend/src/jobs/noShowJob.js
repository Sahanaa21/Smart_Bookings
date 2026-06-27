const cron = require('node-cron');
const dayjs = require('dayjs');
const Booking = require('../models/Booking');
const { BOOKING_STATUS } = require('../utils/constants');
const { getSetting } = require('../services/settingsService');
const { createBookingHistory } = require('../services/bookingService');

const startNoShowJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    const checkInWindowMinutes = await getSetting('checkInWindowMinutes', 15);
    const now = dayjs();

    const bookings = await Booking.find({
      status: BOOKING_STATUS.APPROVED,
      checkInAt: { $exists: false },
    });

    await Promise.all(
      bookings.map(async (booking) => {
        const cutoff = dayjs(`${booking.date} ${booking.startTime}`).add(checkInWindowMinutes, 'minute');
        if (now.isAfter(cutoff)) {
          booking.status = BOOKING_STATUS.CANCELLED;
          booking.noShowCancelledAt = new Date();
          await booking.save();
          await createBookingHistory(
            booking._id,
            'No-show cancellation',
            null,
            { status: BOOKING_STATUS.APPROVED },
            { status: BOOKING_STATUS.CANCELLED }
          );
        }
      })
    );
  });
};

module.exports = startNoShowJob;
