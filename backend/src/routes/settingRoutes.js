const express = require('express');
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const SystemSetting = require('../models/SystemSetting');
const { setSetting } = require('../services/settingsService');
const { logAudit } = require('../utils/audit');

const router = express.Router();
router.use(auth);

router.get('/', allowRoles(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), async (_req, res) => {
  const settings = await SystemSetting.find().lean();
  return res.json(settings);
});

router.put(
  '/:key',
  allowRoles(ROLES.SUPER_ADMIN),
  [body('value').exists()],
  validate,
  async (req, res) => {
    const oldValue = await SystemSetting.findOne({ key: req.params.key }).lean();
    const value = await setSetting(req.params.key, req.body.value);
    await logAudit({
      user: req.user,
      action: 'System setting updated',
      resource: 'SystemSetting',
      oldValue,
      newValue: { key: req.params.key, value },
      ipAddress: req.ip,
    });
    return res.json({ key: req.params.key, value });
  }
);

module.exports = router;
