export function hasStrategyAccess(strategySlug: string) {
  return process.env.DEMO_SUBSCRIBED_STRATEGIES?.split(",").includes(strategySlug) ?? false;
}

export function isAdmin() {
  return process.env.DEMO_ADMIN === "true";
}
