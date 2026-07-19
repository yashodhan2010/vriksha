export type StrategyLabel = "Momentum" | "Quality" | "Value" | "Large Cap" | "Multi Cap";

export type StrategyMetric = {
  label: string;
  value: string;
  hint: string;
};

export type PortfolioHolding = {
  symbol: string;
  company: string;
  sector: string;
  marketcap: string;
  weight: number;
  note: string;
};

export type Rebalance = {
  date: string;
  summary: string;
  changes: Array<{
    symbol: string;
    action: "Added" | "Removed" | "Increased" | "Reduced";
    oldWeight: number;
    newWeight: number;
  }>;
};

export type Strategy = {
  slug: string;
  name: string;
  subtitle: string;
  status: "Open" | "Coming soon";
  labels: StrategyLabel[];
  benchmark: string;
  universe: string;
  rebalanceFrequency: string;
  targetHoldings: number;
  minCapital: string;
  price: string;
  raName: string;
  sebiRegistration: string;
  methodology: string[];
  metrics: StrategyMetric[];
  monthlyReturns: Array<{ month: string; strategy: number; benchmark: number }>;
  yearlyReturns: Array<{ year: string; strategy: number; benchmark: number }>;
  drawdowns: Array<{ period: string; drawdown: number }>;
  holdings: PortfolioHolding[];
  rebalances: Rebalance[];
};
