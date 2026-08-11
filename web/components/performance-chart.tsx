"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TooltipProps } from "recharts";
import { motionDuration, prefersReducedMotion } from "@/lib/motion";

const seriesLabel: Record<string, string> = {
  strategy: "Strategy",
  benchmark: "Benchmark"
};
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLookup = new Map(monthLabels.map((month, index) => [month.toLowerCase(), index]));

type MonthlyReturn = { month: string; strategy: number; benchmark: number };
type HeatmapCell = {
  key: string;
  label: string;
  strategy: number;
  benchmark: number;
};
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-ink">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <li className="flex items-center gap-2" key={entry.dataKey}>
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-ink/62">{seriesLabel[entry.dataKey as string] ?? entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-ink">
              {typeof entry.value === "number" ? `${entry.value.toFixed(1)}%` : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="mb-3 flex items-center gap-4 text-xs text-ink/62">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-pine" aria-hidden="true" />
        Strategy
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-clay" aria-hidden="true" />
        Benchmark
      </span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-72 w-full rounded border border-line bg-white p-4">
      <div className="skeleton mb-4 h-4 w-40" />
      <div className="skeleton h-full w-full" />
    </div>
  );
}

function parseMonthKey(month: string, fallbackIndex: number) {
  const isoMatch = /^(\d{4})-(\d{1,2})/.exec(month);
  if (isoMatch) {
    const monthIndex = Number(isoMatch[2]) - 1;
    if (monthIndex >= 0 && monthIndex <= 11) {
      return { year: isoMatch[1], monthIndex };
    }
  }

  const monthIndex = monthLookup.get(month.slice(0, 3).toLowerCase());
  return {
    year: "Recent",
    monthIndex: monthIndex ?? fallbackIndex % 12
  };
}

function getHeatmapYears(data: MonthlyReturn[]) {
  const byMonth = new Map<string, HeatmapCell>();

  data.forEach((entry, index) => {
    const parsed = parseMonthKey(entry.month, index);
    const key = `${parsed.year}-${String(parsed.monthIndex + 1).padStart(2, "0")}`;
    byMonth.set(key, {
      key,
      label: entry.month,
      strategy: entry.strategy,
      benchmark: entry.benchmark
    });
  });

  const byYear = new Map<string, Array<HeatmapCell | null>>();
  Array.from(byMonth.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, cell]) => {
      const [year, month] = key.split("-");
      const monthIndex = Number(month) - 1;
      if (!byYear.has(year)) {
        byYear.set(year, Array.from({ length: 12 }, () => null));
      }
      byYear.get(year)![monthIndex] = cell;
    });

  return Array.from(byYear.entries()).map(([year, months]) => ({ year, months }));
}

function heatmapColor(value: number | null) {
  if (value === null) return "#f7f4ef";
  const capped = Math.min(Math.abs(value), 12);
  const intensity = 0.14 + (capped / 12) * 0.68;
  const alpha = Number(intensity.toFixed(2));
  if (value > 0) return `rgba(31, 58, 51, ${alpha})`;
  if (value < 0) return `rgba(165, 95, 69, ${alpha})`;
  return "#eee7dc";
}

function heatmapTextColor(value: number | null) {
  if (value === null) return "rgba(24, 33, 31, 0.36)";
  return Math.abs(value) >= 7 ? "#fffaf4" : "#18211f";
}

function formatPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function getMonthlySummary(cells: HeatmapCell[]) {
  if (cells.length === 0) {
    return [
      { label: "Best month", value: "--" },
      { label: "Worst month", value: "--" },
      { label: "Positive months", value: "--" }
    ];
  }

  const values = cells.map((entry) => entry.strategy);
  const best = Math.max(...values);
  const worst = Math.min(...values);
  const positiveRate = (values.filter((value) => value > 0).length / values.length) * 100;
  return [
    { label: "Best month", value: formatPercent(best) },
    { label: "Worst month", value: formatPercent(worst) },
    { label: "Positive months", value: `${positiveRate.toFixed(0)}%` }
  ];
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isNarrow;
}

export function MonthlyPerformanceChart({
  data
}: {
  data: MonthlyReturn[];
}) {
  const heatmapYears = getHeatmapYears(data);
  const summary = getMonthlySummary(heatmapYears.flatMap((year) => year.months).filter((cell): cell is HeatmapCell => Boolean(cell)));

  return (
    <div className="w-full overflow-hidden rounded border border-line bg-white p-3 sm:p-4">
      <div className="mb-3 grid grid-cols-3 gap-2 sm:mb-4">
        {summary.map((item) => (
          <div className="rounded border border-line bg-paper px-2 py-2 sm:px-3" key={item.label}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink/48 sm:text-[11px] sm:tracking-[0.12em]">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-ink sm:text-lg">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink/58 sm:gap-3 sm:text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-clay" aria-hidden="true" />
            Negative
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-pine" aria-hidden="true" />
            Positive
          </span>
        </div>
        <span className="leading-4">Cell color shows strategy monthly return. Press or hover to compare benchmark.</span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-[620px] sm:min-w-[720px]">
          <div className="grid grid-cols-[44px_repeat(12,minmax(42px,1fr))] gap-1 text-[10px] font-semibold text-ink/54 sm:grid-cols-[64px_repeat(12,minmax(48px,1fr))] sm:text-xs">
            <span />
            {monthLabels.map((month) => (
              <span className="text-center" key={month}>{month}</span>
            ))}
          </div>
          <div className="mt-1 grid gap-1">
            {heatmapYears.map((year) => (
              <div className="grid grid-cols-[44px_repeat(12,minmax(42px,1fr))] gap-1 sm:grid-cols-[64px_repeat(12,minmax(48px,1fr))]" key={year.year}>
                <div className="flex items-center text-[10px] font-semibold text-ink/62 sm:text-xs">{year.year}</div>
                {year.months.map((cell, index) => (
                  <div
                    className="flex h-8 items-center justify-center rounded border border-line/70 text-[10px] font-semibold tabular-nums transition duration-180 hover:scale-[1.03] hover:shadow-sm sm:h-9 sm:text-[11px]"
                    key={`${year.year}-${index}`}
                    style={{
                      backgroundColor: heatmapColor(cell?.strategy ?? null),
                      color: heatmapTextColor(cell?.strategy ?? null)
                    }}
                    title={
                      cell
                        ? `${cell.label}: Strategy ${formatPercent(cell.strategy)} | Benchmark ${formatPercent(cell.benchmark)}`
                        : `${year.year} ${monthLabels[index]}: no data`
                    }
                  >
                    {cell ? formatPercent(cell.strategy) : "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function YearlyReturnChart({
  data
}: {
  data: Array<{ year: string; strategy: number; benchmark: number }>;
}) {
  const mounted = useMounted();
  const isNarrow = useNarrowViewport();
  if (!mounted) return <ChartSkeleton />;
  const reduceMotion = prefersReducedMotion();

  return (
    <div className="h-64 w-full rounded border border-line bg-white p-3 sm:h-72 sm:p-4">
      <ChartLegend />
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 8, right: isNarrow ? 4 : 16, bottom: 0, left: isNarrow ? -24 : 0 }}>
          <CartesianGrid stroke="#eee7dc" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: isNarrow ? 10 : 12 }} />
          <YAxis width={isNarrow ? 32 : 44} tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: isNarrow ? 10 : 12 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(31,58,51,0.06)" }} />
          <Bar
            dataKey="strategy"
            fill="#1f3a33"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduceMotion}
            animationDuration={motionDuration.slow}
          />
          <Bar
            dataKey="benchmark"
            fill="#a55f45"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduceMotion}
            animationDuration={motionDuration.slow}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
