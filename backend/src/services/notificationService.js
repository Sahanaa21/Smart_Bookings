const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type = 'InApp' }) =>
  Notification.create({ userId, title, message, type });

module.exports = { createNotification };
