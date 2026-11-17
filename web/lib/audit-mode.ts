/**
 * A one-time, server-enforced public-site restriction for the October 2026
 * regulatory audit. The audit was signed off on 17 November 2026.
 */
export const auditStrategyPath = "/strategies/dual-momentum";
const auditEndsAt = "2026-11-16T23:59:59+05:30";

export function isAuditModeActive(now = Date.now()) {
  const endTime = Date.parse(auditEndsAt);
  return Number.isFinite(endTime) && now < endTime;
}
