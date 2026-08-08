import type { StrategyFamily } from "./strategy-taxonomy";

export type PortfolioNeedId = "core" | "growth" | "stability" | "income";

export type PortfolioNeed = {
  id: PortfolioNeedId;
  title: string;
  shortTitle: string;
  prompt: string;
  description: string;
  matchLabel: string;
  family: StrategyFamily;
  tone: "paper" | "moss" | "gold" | "sky";
};

export const portfolioNeeds: PortfolioNeed[] = [
  {
    id: "core",
    title: "A steadier core",
    shortTitle: "Core",
    prompt: "I need a long-term anchor before adding sharper bets.",
    description: "Start with durable allocation and broad participation before layering specialist strategies.",
    matchLabel: "Mahogany match",
    family: "Mahogany",
    tone: "gold"
  },
  {
    id: "growth",
    title: "More growth participation",
    shortTitle: "Growth",
    prompt: "I want rules-based equity momentum with clear guardrails.",
    description: "Explore higher-velocity systems built for trend participation, periodic refreshes, and 3Y+ patience.",
    matchLabel: "Bamboo match",
    family: "Bamboo",
    tone: "moss"
  },
  {
    id: "stability",
    title: "A smoother equity ride",
    shortTitle: "Stability",
    prompt: "I can take equity risk, but want breadth and drawdown awareness.",
    description: "Look for systems that emphasize resilience, breadth, and less fragile participation.",
    matchLabel: "Banyan match",
    family: "Banyan",
    tone: "sky"
  },
  {
    id: "income",
    title: "Better balance and income",
    shortTitle: "Balance",
    prompt: "I want portfolio ballast, income, and inflation-aware exposure.",
    description: "Use allocation-led research to complement concentrated equity baskets.",
    matchLabel: "Mahogany match",
    family: "Mahogany",
    tone: "paper"
  }
];

export function getPortfolioNeed(id: string | undefined) {
  return portfolioNeeds.find((need) => need.id === id);
}

export function getPortfolioNeedHref(id: PortfolioNeedId) {
  return `/strategies?need=${id}`;
}
