import type { Strategy } from "./types";
import importedStrategies from "./imported-strategies.json";

const fallbackStrategies: Strategy[] = [
  {
    slug: "nifty-quality-momentum",
    name: "Nifty Quality Momentum",
    subtitle: "A monthly rebalanced model portfolio combining price strength and balance sheet quality.",
    status: "Open",
    labels: ["Momentum", "Quality", "Large Cap"],
    benchmark: "NIFTY 500 TRI",
    universe: "NIFTY 500",
    rebalanceFrequency: "Monthly",
    targetHoldings: 20,
    minCapital: "INR 1,00,000",
    price: "INR 4,999 / month",
    raName: "Partner Research Analyst",
    sebiRegistration: "SEBI-RA-REG-NUMBER",
    methodology: [
      "Rank eligible securities using finalized lookback, liquidity, momentum, and quality factors.",
      "Apply exclusions, concentration caps, and sector guardrails from the approved strategy config.",
      "Generate the model portfolio on rebalance day and compare it with the latest published version.",
      "Publish the portfolio and rebalance log only after an admin review."
    ],
    metrics: [
      { label: "CAGR", value: "23.4%", hint: "Backtested annualized return" },
      { label: "Max drawdown", value: "-18.7%", hint: "Largest peak-to-trough decline" },
      { label: "Volatility", value: "16.2%", hint: "Annualized strategy volatility" },
      { label: "Sharpe", value: "1.18", hint: "Risk-adjusted return" },
      { label: "Turnover", value: "22%", hint: "Average rebalance turnover" },
      { label: "Holdings", value: "20", hint: "Target model portfolio count" }
    ],
    monthlyReturns: [
      { month: "Jan", strategy: 2.1, benchmark: 1.3 },
      { month: "Feb", strategy: -1.8, benchmark: -2.5 },
      { month: "Mar", strategy: 3.7, benchmark: 2.2 },
      { month: "Apr", strategy: 1.2, benchmark: 0.8 },
      { month: "May", strategy: 4.4, benchmark: 2.9 },
      { month: "Jun", strategy: -0.6, benchmark: -1.1 }
    ],
    yearlyReturns: [
      { year: "2021", strategy: 31.4, benchmark: 25.1 },
      { year: "2022", strategy: 9.8, benchmark: 4.3 },
      { year: "2023", strategy: 28.2, benchmark: 21.6 },
      { year: "2024", strategy: 18.9, benchmark: 15.2 },
      { year: "2025", strategy: 22.1, benchmark: 13.7 }
    ],
    drawdowns: [
      { period: "2021", drawdown: -8.3 },
      { period: "2022", drawdown: -18.7 },
      { period: "2023", drawdown: -9.4 },
      { period: "2024", drawdown: -11.2 },
      { period: "2025", drawdown: -7.8 }
    ],
    holdings: [
      { symbol: "HDFCBANK", company: "HDFC Bank", sector: "Financials", marketcap: "Large", weight: 0.082, note: "Quality and liquidity anchor" },
      { symbol: "INFY", company: "Infosys", sector: "IT", marketcap: "Large", weight: 0.074, note: "Momentum recovery" },
      { symbol: "LT", company: "Larsen & Toubro", sector: "Industrials", marketcap: "Large", weight: 0.068, note: "Trend persistence" },
      { symbol: "SUNPHARMA", company: "Sun Pharma", sector: "Healthcare", marketcap: "Large", weight: 0.061, note: "Defensive strength" },
      { symbol: "TITAN", company: "Titan", sector: "Consumer", marketcap: "Large", weight: 0.058, note: "Quality compounder" }
    ],
    rebalances: [
      {
        date: "2026-07-01",
        summary: "Reduced financial concentration and added defensive healthcare exposure.",
        changes: [
          { symbol: "SUNPHARMA", action: "Added", oldWeight: 0, newWeight: 0.061 },
          { symbol: "HDFCBANK", action: "Reduced", oldWeight: 0.094, newWeight: 0.082 }
        ]
      },
      {
        date: "2026-06-01",
        summary: "Momentum scores improved in industrials and IT.",
        changes: [
          { symbol: "LT", action: "Increased", oldWeight: 0.052, newWeight: 0.068 },
          { symbol: "INFY", action: "Added", oldWeight: 0, newWeight: 0.074 }
        ]
      }
    ]
  }
];

export const strategies: Strategy[] =
  Array.isArray(importedStrategies) && importedStrategies.length > 0
    ? (importedStrategies as Strategy[]).map((strategy) => ({
      ...strategy,
      labels: strategy.labels.filter((label) => !/conservative|low\s*drawdown/i.test(label))
    }))
    : fallbackStrategies;

export function getStrategy(slug: string) {
  return strategies.find((strategy) => strategy.slug === slug);
}
