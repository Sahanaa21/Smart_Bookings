const express = require('express');
const auth = require('../middlewares/auth');
const Notification = require('../models/Notification');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  return res.json(notifications);
});

router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  return res.json(notification);
});

module.exports = router;
