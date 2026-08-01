import { strategies } from "./data";

export type BillingCycle = "monthly" | "quarterly" | "annual";
export type ClientType = "individual" | "huf" | "non_individual" | "accredited_investor";

export const billingCycles: Array<{ id: BillingCycle; label: string; accessDays: number }> = [
  { id: "monthly", label: "Monthly", accessDays: 30 },
  { id: "quarterly", label: "Quarterly", accessDays: 90 },
  { id: "annual", label: "Annual", accessDays: 365 }
];

export const individualFamilyAnnualFeeCapPaise = 15100000;

const subscriptionPrices: Record<string, Record<BillingCycle, number>> = {
  "dual-momentum": {
    monthly: 499900,
    quarterly: 1299900,
    annual: 4799900
  },
  "conservative-dual-momentum": {
    monthly: 399900,
    quarterly: 999900,
    annual: 3599900
  },
  "low-drawdown-dual-momentum": {
    monthly: 599900,
    quarterly: 1499900,
    annual: 5399900
  }
};

export function formatMoney(amountPaise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountPaise / 100);
}

export function getStrategyPrice(strategySlug: string, billingCycle: BillingCycle) {
  const amountPaise = subscriptionPrices[strategySlug]?.[billingCycle] ?? 499900;
  const cycle = billingCycles.find((item) => item.id === billingCycle) ?? billingCycles[0];

  return {
    strategySlug,
    billingCycle,
    amountPaise,
    currency: "INR",
    accessDays: cycle.accessDays
  };
}

export function getPricedStrategies(billingCycle: BillingCycle = "monthly") {
  return strategies.map((strategy) => ({
    strategy,
    price: getStrategyPrice(strategy.slug, billingCycle)
  }));
}

export function calculateBasket(strategySlugs: string[], billingCycle: BillingCycle) {
  const uniqueSlugs = [...new Set(strategySlugs)];
  const items = uniqueSlugs.map((slug) => {
    const strategy = strategies.find((item) => item.slug === slug);
    if (!strategy) return null;

    return {
      strategy,
      price: getStrategyPrice(slug, billingCycle)
    };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const subtotalPaise = items.reduce((sum, item) => sum + item.price.amountPaise, 0);

  return {
    items,
    subtotalPaise,
    taxPaise: 0,
    totalPaise: subtotalPaise,
    currency: "INR"
  };
}
