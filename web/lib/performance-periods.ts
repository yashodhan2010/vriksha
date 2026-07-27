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
  monthsUsed: number;
};

export type PeriodPerformancePoint = {
  label: string;
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

function getWindow(data: Strategy["monthlyReturns"], period: PerformancePeriod) {
  if (data.length === 0) return [];
  const months = period.key === "max" ? Math.min(period.months, data.length) : period.months;
  if (period.key !== "max" && data.length < months) return [];

  return data.slice(-months);
}

export function getPeriodReturns(strategy: Strategy): PeriodReturn[] {
  return performancePeriods.map((period) => {
    const data = getWindow(strategy.monthlyReturns, period);

    return {
      key: period.key,
      label: period.label,
      strategy: data.length > 0 ? compoundReturn(data.map((item) => item.strategy)) : null,
      benchmark: data.length > 0 ? compoundReturn(data.map((item) => item.benchmark)) : null,
      monthsUsed: data.length
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
