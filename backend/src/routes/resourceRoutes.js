const express = require('express');
const { body } = require('express-validator');
const Resource = require('../models/Resource');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { logAudit } = require('../utils/audit');
const { toSafeString, toSafeObjectId } = require('../utils/sanitize');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const type = toSafeString(req.query.type, { maxLength: 30 });
  const status = toSafeString(req.query.status, { maxLength: 30 });
  const building = toSafeString(req.query.building, { maxLength: 60 });
  const query = {};
  if (type && ['Auditorium', 'Meeting Room'].includes(type)) query.type = type;
  if (status && ['Active', 'Under Maintenance', 'Disabled'].includes(status)) query.status = status;
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
    const safeName = toSafeString(req.body.name, { maxLength: 100 });
    const safeType = toSafeString(req.body.type, { maxLength: 30 });
    const safeBuilding = toSafeString(req.body.building, { maxLength: 60 });
    if (!safeName || !safeType || !safeBuilding) {
      return res.status(400).json({ message: 'Invalid resource input' });
    }
    const resource = await Resource.create({
      name: safeName,
      type: safeType,
      capacity: Number(req.body.capacity),
      building: safeBuilding,
      floor: toSafeString(req.body.floor, { maxLength: 20 }),
      description: toSafeString(req.body.description, { maxLength: 300 }),
      facilities: Array.isArray(req.body.facilities)
        ? req.body.facilities.map((item) => toSafeString(item, { maxLength: 50 })).filter(Boolean)
        : [],
      projectorAvailable: Boolean(req.body.projectorAvailable),
      acAvailable: Boolean(req.body.acAvailable),
      soundSystemAvailable: Boolean(req.body.soundSystemAvailable),
      status: req.body.status || 'Active',
    });
    await logAudit({ user: req.user, action: 'Resource created', resource: 'Resource', newValue: resource, ipAddress: req.ip });
    return res.status(201).json(resource);
  }
);

router.put('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.DEAN), async (req, res) => {
  const resourceId = toSafeObjectId(req.params.id);
  if (!resourceId) return res.status(400).json({ message: 'Invalid resource id' });
  const oldValue = await Resource.findById(resourceId).lean();
  const allowedUpdate = {};
  const name = toSafeString(req.body.name, { maxLength: 100 });
  const type = toSafeString(req.body.type, { maxLength: 30 });
  const building = toSafeString(req.body.building, { maxLength: 60 });
  const floor = toSafeString(req.body.floor, { maxLength: 20 });
  const description = toSafeString(req.body.description, { maxLength: 300 });
  const status = toSafeString(req.body.status, { maxLength: 30 });
  if (name) allowedUpdate.name = name;
  if (type && ['Auditorium', 'Meeting Room'].includes(type)) allowedUpdate.type = type;
  if (building) allowedUpdate.building = building;
  if (floor) allowedUpdate.floor = floor;
  if (description) allowedUpdate.description = description;
  if (status && ['Active', 'Under Maintenance', 'Disabled'].includes(status)) allowedUpdate.status = status;
  if (req.body.capacity !== undefined) allowedUpdate.capacity = Number(req.body.capacity);
  if (Array.isArray(req.body.facilities)) {
    allowedUpdate.facilities = req.body.facilities
      .map((item) => toSafeString(item, { maxLength: 50 }))
      .filter(Boolean);
  }
  if (req.body.projectorAvailable !== undefined) allowedUpdate.projectorAvailable = Boolean(req.body.projectorAvailable);
  if (req.body.acAvailable !== undefined) allowedUpdate.acAvailable = Boolean(req.body.acAvailable);
  if (req.body.soundSystemAvailable !== undefined) allowedUpdate.soundSystemAvailable = Boolean(req.body.soundSystemAvailable);
  const updated = await Resource.findByIdAndUpdate(resourceId, allowedUpdate, { new: true, runValidators: true });
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
  const resourceId = toSafeObjectId(req.params.id);
  if (!resourceId) return res.status(400).json({ message: 'Invalid resource id' });
  const deleted = await Resource.findByIdAndDelete(resourceId);
  if (!deleted) return res.status(404).json({ message: 'Resource not found' });

  await logAudit({ user: req.user, action: 'Resource deleted', resource: 'Resource', oldValue: deleted, ipAddress: req.ip });
  return res.json({ message: 'Resource deleted' });
});

module.exports = router;
