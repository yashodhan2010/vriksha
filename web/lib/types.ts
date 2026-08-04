export type StrategyLabel = string;

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
    action: "Added" | "Removed" | "Increased" | "Reduced" | "Weight changed" | "Unchanged";
    oldWeight: number;
    newWeight: number;
  }>;
};

export type Strategy = {
  slug: string;
  name: string;
  public_name?: string;
  internal_name?: string;
  subtitle: string;
  status: "Open" | "Coming soon";
  labels: StrategyLabel[];
  benchmark: string;
  benchmarkComposition?: string;
  universe: string;
  rebalanceFrequency: string;
  targetHoldings: number;
  minCapital: string;
  price: string;
  raName: string;
  sebiRegistration: string;
  methodology: string[];
  methodologySections?: Array<{ title: string; body: string }>;
  suitability?: string;
  targetInvestor?: string;
  keyRisks?: string[];
  metrics: StrategyMetric[];
  monthlyReturns: Array<{ month: string; strategy: number; benchmark: number }>;
  yearlyReturns: Array<{ year: string; strategy: number; benchmark: number }>;
  drawdowns: Array<{ period: string; drawdown: number }>;
  holdings: PortfolioHolding[];
  rebalances: Rebalance[];
  exports?: {
    latestModelPortfolioCsv?: string;
    rebalanceHistoryCsv?: string;
  };
};
