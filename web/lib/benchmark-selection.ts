import type { BenchmarkComparison, Strategy } from "./types";

export const selectableBenchmarks = [
  "NIFTY 500 TRI",
  "NIFTY 50",
  "NIFTY 500",
  "NIFTY Gsec Composite",
  "Gold"
] as const;

const benchmarkAliases: Record<string, string[]> = {
  "NIFTY 50": ["NIFTY 50"],
  "NIFTY 500": ["NIFTY 500"],
  "NIFTY 500 TRI": ["NIFTY 500 TRI"],
  "NIFTY Gsec Composite": ["NIFTY Gsec Composite", "NIFTY G-sec Composite", "NIFTY GSEC Composite", "NIFTY G-Sec Composite"],
  Gold: ["Gold", "GOLD"]
};

function aliasesFor(label: string) {
  return benchmarkAliases[label] ?? [label];
}

function sameBenchmark(left: string, right: string) {
  return aliasesFor(left).some((alias) => alias.toLowerCase() === right.toLowerCase());
}

export function getBenchmarkComparisons(strategy: Strategy): BenchmarkComparison[] {
  const comparisons = strategy.benchmarkComparisons ?? [];
  if (comparisons.length > 0) return comparisons;

  return [{
    label: strategy.benchmark,
    dailyReturns: strategy.dailyReturns?.map((point) => ({
      date: point.date,
      return: point.benchmarkReturn,
      equityCurve: point.benchmark
    })),
    monthlyReturns: strategy.monthlyReturns.map((point) => ({
      month: point.month,
      benchmark: point.benchmark
    })),
    yearlyReturns: strategy.yearlyReturns.map((point) => ({
      year: point.year,
      benchmark: point.benchmark
    }))
  }];
}

export function findBenchmarkComparison(strategy: Strategy, label: string) {
  return getBenchmarkComparisons(strategy).find((comparison) => sameBenchmark(label, comparison.label));
}

export function getBenchmarkOptionLabels(strategy: Strategy) {
  const labels = new Set<string>(selectableBenchmarks);
  getBenchmarkComparisons(strategy).forEach((comparison) => labels.add(comparison.label));
  return Array.from(labels);
}

export function getSelectedBenchmarkLabel(strategy: Strategy, requestedLabel?: string) {
  if (requestedLabel && findBenchmarkComparison(strategy, requestedLabel)) return requestedLabel;
  const preferred = selectableBenchmarks.find((label) => findBenchmarkComparison(strategy, label));
  return preferred ?? strategy.benchmark;
}

function alignDailyReturns(strategy: Strategy, comparison: BenchmarkComparison) {
  if (!strategy.dailyReturns || !comparison.dailyReturns) return strategy.dailyReturns;
  const benchmarkByDate = new Map(comparison.dailyReturns.map((point) => [point.date, point]));
  const aligned = strategy.dailyReturns
    .map((point) => {
      const benchmark = benchmarkByDate.get(point.date);
      if (!benchmark) return null;
      return {
        ...point,
        benchmark: benchmark.equityCurve,
        benchmarkReturn: benchmark.return
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  return aligned.length >= 2 ? aligned : strategy.dailyReturns;
}

export function applyBenchmarkComparison(strategy: Strategy, label: string): Strategy {
  const comparison = findBenchmarkComparison(strategy, label);
  if (!comparison) return strategy;

  const monthlyByMonth = new Map((comparison.monthlyReturns ?? []).map((point) => [point.month, point.benchmark]));
  const yearlyByYear = new Map((comparison.yearlyReturns ?? []).map((point) => [point.year, point.benchmark]));

  return {
    ...strategy,
    benchmark: comparison.label,
    dailyReturns: alignDailyReturns(strategy, comparison),
    monthlyReturns: strategy.monthlyReturns.map((point) => ({
      ...point,
      benchmark: monthlyByMonth.get(point.month) ?? point.benchmark
    })),
    yearlyReturns: strategy.yearlyReturns.map((point) => ({
      ...point,
      benchmark: yearlyByYear.get(point.year) ?? point.benchmark
    }))
  };
}
