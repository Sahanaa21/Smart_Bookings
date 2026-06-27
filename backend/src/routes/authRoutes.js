const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { signToken } = require('../utils/jwt');
const { logAudit } = require('../utils/audit');
const { toSafeString } = require('../utils/sanitize');

const router = express.Router();

router.post(
  '/login',
  [body('employeeId').notEmpty(), body('password').notEmpty()],
  validate,
  async (req, res) => {
    const employeeId = toSafeString(req.body.employeeId, { maxLength: 30, pattern: /^[A-Za-z0-9_-]+$/ });
    const password = toSafeString(req.body.password, { maxLength: 100 });
    if (!employeeId || !password) return res.status(400).json({ message: 'Invalid credentials format' });
    const user = await User.findOne({ employeeId });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ userId: user._id, role: user.role });
    await logAudit({ user, action: 'Login', resource: 'Auth', ipAddress: req.ip });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  }
);

router.post('/logout', auth, async (req, res) => {
  await logAudit({ user: req.user, action: 'Logout', resource: 'Auth', ipAddress: req.ip });
  return res.json({ message: 'Logged out' });
});

router.post(
  '/change-password',
  auth,
  [body('oldPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const valid = await user.comparePassword(oldPassword);
    if (!valid) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    await logAudit({ user, action: 'Password changed', resource: 'User', ipAddress: req.ip });
    return res.json({ message: 'Password updated' });
  }
);

router.post('/request-password-reset', [body('employeeId').notEmpty()], validate, async (req, res) => {
  const employeeId = toSafeString(req.body.employeeId, { maxLength: 30, pattern: /^[A-Za-z0-9_-]+$/ });
  if (!employeeId) return res.json({ message: 'If the account exists, reset instructions are generated.' });
  const user = await User.findOne({ employeeId });
  if (user) {
    user.passwordResetToken = crypto.randomBytes(16).toString('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
  }
  return res.json({ message: 'If the account exists, reset instructions are generated.' });
});

router.post(
  '/reset-password',
  [body('employeeId').notEmpty(), body('token').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  async (req, res) => {
    const employeeId = toSafeString(req.body.employeeId, { maxLength: 30, pattern: /^[A-Za-z0-9_-]+$/ });
    const token = toSafeString(req.body.token, { maxLength: 128, pattern: /^[A-Fa-f0-9]+$/ });
    const newPassword = toSafeString(req.body.newPassword, { maxLength: 100 });
    if (!employeeId || !token || !newPassword) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    const user = await User.findOne({
      employeeId,
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    user.mustChangePassword = false;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  }
);

module.exports = router;
