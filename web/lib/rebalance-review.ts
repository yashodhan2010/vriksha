import type { Rebalance, Strategy } from "./types";

export type RebalanceClassification = "ADDED" | "EXITED" | "INCREASED" | "REDUCED" | "UNCHANGED" | "INITIAL";

export type RebalanceReviewItem = {
  id: string;
  symbol: string;
  company: string;
  sector: string;
  previousWeight: number;
  newWeight: number;
  difference: number;
  classification: RebalanceClassification;
  note?: string;
};

export type RebalanceReviewModel = {
  strategySlug: string;
  rebalanceDate: string;
  version: string;
  previousModelDate: string | null;
  newModelDate: string;
  isInitialPublication: boolean;
  items: RebalanceReviewItem[];
  changedItems: RebalanceReviewItem[];
  unchangedItems: RebalanceReviewItem[];
  totalTargetWeight: number;
  reconciles: boolean;
  counts: Record<RebalanceClassification, number>;
};

export const weightTolerance = 0.00001;

const classificationOrder: Record<RebalanceClassification, number> = {
  EXITED: 0,
  REDUCED: 1,
  ADDED: 2,
  INCREASED: 3,
  UNCHANGED: 4,
  INITIAL: 5
};

export function classifyWeightChange(previousWeight: number | null | undefined, newWeight: number | null | undefined) {
  const previous = previousWeight ?? 0;
  const next = newWeight ?? 0;

  if (previous <= weightTolerance && next > weightTolerance) return "ADDED" satisfies RebalanceClassification;
  if (previous > weightTolerance && next <= weightTolerance) return "EXITED" satisfies RebalanceClassification;
  if (next - previous > weightTolerance) return "INCREASED" satisfies RebalanceClassification;
  if (previous - next > weightTolerance) return "REDUCED" satisfies RebalanceClassification;
  return "UNCHANGED" satisfies RebalanceClassification;
}

export function getChangeId(strategySlug: string, rebalanceDate: string, symbol: string) {
  return `${strategySlug}:${rebalanceDate}:${symbol}`;
}

export function formatPercentagePointChange(value: number) {
  const points = value * 100;
  const sign = points > weightTolerance ? "+" : "";
  return `${sign}${points.toFixed(2)} pp`;
}

export function buildRebalanceReviewModel(strategy: Strategy, rebalance: Rebalance): RebalanceReviewModel {
  const rebalanceIndex = strategy.rebalances.findIndex((item) => item.date === rebalance.date);
  const previousModelDate = rebalanceIndex >= 0 ? strategy.rebalances[rebalanceIndex + 1]?.date ?? null : null;
  const isInitialPublication = !previousModelDate && rebalance.changes.length === 0;
  const currentBySymbol = new Map(strategy.holdings.map((holding) => [holding.symbol, holding]));
  const rows = new Map<string, RebalanceReviewItem>();

  strategy.holdings.forEach((holding) => {
    rows.set(holding.symbol, {
      id: getChangeId(strategy.slug, rebalance.date, holding.symbol),
      symbol: holding.symbol,
      company: holding.company,
      sector: holding.sector,
      previousWeight: holding.weight,
      newWeight: holding.weight,
      difference: 0,
      classification: isInitialPublication ? "INITIAL" : "UNCHANGED",
      note: holding.note
    });
  });

  rebalance.changes.forEach((change) => {
    const holding = currentBySymbol.get(change.symbol);
    const classification = classifyWeightChange(change.oldWeight, change.newWeight);
    rows.set(change.symbol, {
      id: getChangeId(strategy.slug, rebalance.date, change.symbol),
      symbol: change.symbol,
      company: holding?.company ?? change.symbol,
      sector: holding?.sector ?? "Exited from model",
      previousWeight: change.oldWeight,
      newWeight: change.newWeight,
      difference: change.newWeight - change.oldWeight,
      classification,
      note: holding?.note
    });
  });

  const items = Array.from(rows.values()).sort((a, b) => {
    const order = classificationOrder[a.classification] - classificationOrder[b.classification];
    if (order !== 0) return order;
    return Math.abs(b.difference) - Math.abs(a.difference) || a.symbol.localeCompare(b.symbol);
  });
  const totalTargetWeight = strategy.holdings.reduce((sum, holding) => sum + holding.weight, 0);
  const counts = {
    ADDED: 0,
    EXITED: 0,
    INCREASED: 0,
    REDUCED: 0,
    UNCHANGED: 0,
    INITIAL: 0
  };

  items.forEach((item) => {
    counts[item.classification] += 1;
  });

  return {
    strategySlug: strategy.slug,
    rebalanceDate: rebalance.date,
    version: `Model portfolio version ${Math.max(strategy.rebalances.length - rebalanceIndex, 1)}`,
    previousModelDate,
    newModelDate: rebalance.date,
    isInitialPublication,
    items,
    changedItems: items.filter((item) => !["UNCHANGED", "INITIAL"].includes(item.classification)),
    unchangedItems: items.filter((item) => item.classification === "UNCHANGED"),
    totalTargetWeight,
    reconciles: Math.abs(totalTargetWeight - 1) <= 0.01 || totalTargetWeight <= 1 + weightTolerance,
    counts
  };
}

export function getReviewProgress(reviewedIds: string[], reviewableItems: Array<{ id: string }>) {
  const reviewable = new Set(reviewableItems.map((item) => item.id));
  const reviewed = reviewedIds.filter((id) => reviewable.has(id));
  const total = reviewable.size;

  return {
    reviewedCount: reviewed.length,
    totalCount: total,
    complete: total > 0 && reviewed.length === total,
    percent: total === 0 ? 100 : Math.round((reviewed.length / total) * 100)
  };
}
