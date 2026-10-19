/**
 * A one-time, server-enforced public-site restriction for the October 2026
 * regulatory audit. Keep it active until the audit is explicitly signed off.
 */
export const auditStrategyPath = "/strategies/dual-momentum";
const auditEndsAt: string | null = null;

export function isAuditModeActive(now = Date.now()) {
  if (!auditEndsAt) return true;

  const endTime = Date.parse(auditEndsAt);
  return Number.isFinite(endTime) && now < endTime;
}
