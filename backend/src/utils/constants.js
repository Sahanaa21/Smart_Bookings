const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  CHAIRMAN: 'Chairman',
  PRINCIPAL: 'Principal',
  DEAN: 'Dean',
  HOD: 'HOD',
  FACULTY: 'Faculty',
  STAFF: 'Staff',
};

const DEFAULT_PRIORITY = {
  [ROLES.CHAIRMAN]: 1,
  [ROLES.PRINCIPAL]: 2,
  [ROLES.DEAN]: 3,
  [ROLES.HOD]: 4,
  [ROLES.FACULTY]: 5,
  [ROLES.STAFF]: 6,
  [ROLES.SUPER_ADMIN]: 0,
};

const BOOKING_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  OVERRIDDEN: 'Overridden',
};

module.exports = { ROLES, DEFAULT_PRIORITY, BOOKING_STATUS };
