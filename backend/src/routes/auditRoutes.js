const express = require('express');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const { ROLES } = require('../utils/constants');
const AuditLog = require('../models/AuditLog');

const router = express.Router();
router.use(auth);

router.get('/', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(Number(req.query.limit) || 100).lean();
  return res.json(logs);
});

module.exports = router;
