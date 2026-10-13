/**
 * A one-time, server-enforced public-site restriction for the October 2026
 * regulatory audit. It expires automatically at the end of 15 October (IST).
 */
export const auditStrategyPath = "/strategies/dual-momentum";
const auditEndsAt = "2026-10-15T23:59:59+05:30";

export function isAuditModeActive(now = Date.now()) {
  const endTime = Date.parse(auditEndsAt);
  return Number.isFinite(endTime) && now < endTime;
}
