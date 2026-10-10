import { strategies } from "./data";
import { getStrategyPrice, type BillingCycle } from "./pricing-core";

export {
  billingCycles,
  formatMoney,
  getStrategyPrice,
  individualFamilyAnnualFeeCapPaise,
  type BillingCycle,
  type ClientType
} from "./pricing-core";

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
