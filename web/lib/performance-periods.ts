import type { Strategy } from "./types";

export type PerformancePeriodKey = "1m" | "6m" | "1y" | "5y" | "max";

export type PerformancePeriod = {
  key: PerformancePeriodKey;
  label: string;
  months: number;
};

export type PeriodReturn = {
  key: PerformancePeriodKey;
  label: string;
  strategy: number | null;
  benchmark: number | null;
  cagr: number | null;
  maxDrawdown: number | null;
  monthsUsed: number;
};

export type PeriodPerformancePoint = {
  label: string;
  strategy: number;
  benchmark: number;
};

type NormalizedPoint = {
  month: string;
  date: Date;
  strategy: number;
  benchmark: number;
};

export const performancePeriods: PerformancePeriod[] = [
  { key: "1m", label: "1M", months: 1 },
  { key: "6m", label: "6M", months: 6 },
  { key: "1y", label: "1Y", months: 12 },
  { key: "5y", label: "5Y", months: 60 },
  { key: "max", label: "Max (10Y)", months: 120 }
];

function compoundReturn(values: number[]) {
  return (values.reduce((total, value) => total * (1 + value / 100), 1) - 1) * 100;
}

function annualizedReturn(totalReturn: number, months: number) {
  if (months <= 0) return null;

  return (Math.pow(1 + totalReturn / 100, 12 / months) - 1) * 100;
}

function parseMonthKey(month: string) {
  const parsed = new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthDiff(start: Date, end: Date) {
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

function inferCadenceMonths(points: NormalizedPoint[]) {
  if (points.length < 2) return 1;

  const diffs = points
    .slice(1)
    .map((point, index) => monthDiff(points[index].date, point.date))
    .filter((value) => value > 0);

  if (diffs.length === 0) return 1;

  const counts = new Map<number, number>();
  diffs.forEach((diff) => counts.set(diff, (counts.get(diff) ?? 0) + 1));

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1;
}

function normalizeMonthlyReturns(data: Strategy["monthlyReturns"]) {
  const grouped = new Map<string, Strategy["monthlyReturns"]>();

  data.forEach((item) => {
    grouped.set(item.month, [...(grouped.get(item.month) ?? []), item]);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, items]) => {
      const date = parseMonthKey(month);
      if (!date) return null;

      return {
        month,
        date,
        strategy: compoundReturn(items.map((item) => item.strategy)),
        benchmark: items[items.length - 1].benchmark
      };
    })
    .filter((item): item is NormalizedPoint => item !== null);
}

function getWindow(data: Strategy["monthlyReturns"], period: PerformancePeriod) {
  const points = normalizeMonthlyReturns(data);
  if (points.length === 0) return [];

  const latest = points[points.length - 1].date;
  const cadenceMonths = inferCadenceMonths(points);

  if (period.key !== "max" && period.months < cadenceMonths) {
    return [];
  }

  const cutoff = new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth() - period.months + 1, 1));
  const window = period.key === "max"
    ? points.filter((point) => point.date >= cutoff)
    : points.filter((point) => point.date >= cutoff);

  if (window.length === 0) return [];

  if (period.key !== "max") {
    const coveredMonths = monthDiff(window[0].date, latest) + cadenceMonths;
    if (coveredMonths < period.months) {
      return [];
    }
  }

  return window;
}

function getWindowStartMonth(data: Strategy["monthlyReturns"], period: PerformancePeriod) {
  return getWindow(data, period)[0]?.month ?? null;
}

function getMaxDrawdown(strategy: Strategy, startMonth: string | null) {
  const drawdowns = startMonth
    ? strategy.drawdowns.filter((item) => item.period >= startMonth)
    : strategy.drawdowns;
  if (drawdowns.length === 0) return null;

  return Math.min(...drawdowns.map((item) => item.drawdown));
}

export function getPeriodReturns(strategy: Strategy): PeriodReturn[] {
  return performancePeriods.map((period) => {
    const data = getWindow(strategy.monthlyReturns, period);
    const startMonth = getWindowStartMonth(strategy.monthlyReturns, period);
    const cadenceMonths = inferCadenceMonths(data);
    const monthsCovered = data.length === 0
      ? 0
      : monthDiff(data[0].date, data[data.length - 1].date) + cadenceMonths;
    const totalReturn = data.length > 0 ? compoundReturn(data.map((item) => item.strategy)) : null;

    return {
      key: period.key,
      label: period.label,
      strategy: totalReturn,
      benchmark: data.length > 0 ? compoundReturn(data.map((item) => item.benchmark)) : null,
      cagr: totalReturn === null ? null : annualizedReturn(totalReturn, monthsCovered),
      maxDrawdown: data.length > 0 ? getMaxDrawdown(strategy, startMonth) : null,
      monthsUsed: monthsCovered
    };
  });
}

export function getPeriodPerformanceSeries(
  strategy: Strategy,
  periodKey: PerformancePeriodKey
): PeriodPerformancePoint[] {
  const period = performancePeriods.find((item) => item.key === periodKey) ?? performancePeriods[0];
  const data = getWindow(strategy.monthlyReturns, period);
  let strategyCurve = 1;
  let benchmarkCurve = 1;

  return data.map((item) => {
    strategyCurve *= 1 + item.strategy / 100;
    benchmarkCurve *= 1 + item.benchmark / 100;

    return {
      label: item.month,
      strategy: (strategyCurve - 1) * 100,
      benchmark: (benchmarkCurve - 1) * 100
    };
  });
}

export function formatPercent(value: number | null) {
  if (value === null) return "NA";

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
