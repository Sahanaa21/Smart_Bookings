const express = require('express');
const { body } = require('express-validator');
const Resource = require('../models/Resource');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const { type, status, building } = req.query;
  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (building) query.building = building;

  const resources = await Resource.find(query).sort({ name: 1 }).lean();
  return res.json(resources);
});

router.post(
  '/',
  allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN),
  [body('name').notEmpty(), body('type').isIn(['Auditorium', 'Meeting Room']), body('capacity').isInt({ min: 1 }), body('building').notEmpty()],
  validate,
  async (req, res) => {
    const resource = await Resource.create(req.body);
    await logAudit({ user: req.user, action: 'Resource created', resource: 'Resource', newValue: resource, ipAddress: req.ip });
    return res.status(201).json(resource);
  }
);

router.put('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN), async (req, res) => {
  const oldValue = await Resource.findById(req.params.id).lean();
  const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Resource not found' });

  await logAudit({
    user: req.user,
    action: 'Resource modified',
    resource: 'Resource',
    oldValue,
    newValue: updated,
    ipAddress: req.ip,
  });

  return res.json(updated);
});

router.delete('/:id', allowRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  const deleted = await Resource.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Resource not found' });

  await logAudit({ user: req.user, action: 'Resource deleted', resource: 'Resource', oldValue: deleted, ipAddress: req.ip });
  return res.json({ message: 'Resource deleted' });
});

module.exports = router;
