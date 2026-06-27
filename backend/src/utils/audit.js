const AuditLog = require('../models/AuditLog');

const logAudit = async ({ user, action, resource, oldValue, newValue, ipAddress }) => {
  await AuditLog.create({
    userId: user?._id,
    employeeId: user?.employeeId,
    ipAddress,
    action,
    resource,
    oldValue,
    newValue,
  });
};

module.exports = { logAudit };
