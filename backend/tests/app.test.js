const { hasTimeOverlap, canOverrideRole } = require('../src/services/bookingService');
const { ROLES } = require('../src/utils/constants');

describe('booking engine core logic', () => {
  test('detects overlapping slots correctly', () => {
    expect(hasTimeOverlap('10:00', '11:00', '10:30', '11:30')).toBe(true);
    expect(hasTimeOverlap('10:00', '11:00', '11:00', '12:00')).toBe(false);
    expect(hasTimeOverlap('09:00', '10:00', '08:00', '09:00')).toBe(false);
  });

  test('allows override only for chairman, principal, super admin', () => {
    expect(canOverrideRole(ROLES.CHAIRMAN)).toBe(true);
    expect(canOverrideRole(ROLES.PRINCIPAL)).toBe(true);
    expect(canOverrideRole(ROLES.SUPER_ADMIN)).toBe(true);
    expect(canOverrideRole(ROLES.FACULTY)).toBe(false);
    expect(canOverrideRole(ROLES.STAFF)).toBe(false);
  });
});
