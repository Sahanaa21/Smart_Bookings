const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { logAudit } = require('../utils/audit');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL),
  [
    body('name').notEmpty(),
    body('employeeId').notEmpty(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(Object.values(ROLES)),
  ],
  validate,
  async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      employeeId: req.body.employeeId,
      email: req.body.email,
      role: req.body.role,
      department: req.body.department,
      passwordHash,
      createdBy: req.user._id,
      mustChangePassword: true,
      isActive: true,
    });

    await logAudit({
      user: req.user,
      action: 'User created',
      resource: 'User',
      newValue: { employeeId: user.employeeId, role: user.role },
      ipAddress: req.ip,
    });

    return res.status(201).json(user);
  }
);

router.get('/', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN), async (_req, res) => {
  const users = await User.find().select('-passwordHash').lean();
  return res.json(users);
});

router.patch('/:id/activation', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(isActive) }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  await logAudit({
    user: req.user,
    action: isActive ? 'Account activated' : 'Account deactivated',
    resource: 'User',
    newValue: { userId: user._id, isActive: user.isActive },
    ipAddress: req.ip,
  });

  return res.json(user);
});

module.exports = router;
