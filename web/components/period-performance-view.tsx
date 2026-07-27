"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TooltipProps } from "recharts";
import { cn } from "@/lib/cn";
import {
  formatPercent,
  getPeriodPerformanceSeries,
  getPeriodReturns,
  performancePeriods,
  type PerformancePeriodKey
} from "@/lib/performance-periods";
import type { Strategy } from "@/lib/types";

function getChartTicks(series: Array<{ label: string }>, periodKey: PerformancePeriodKey) {
  if (series.length <= 12) return series.map((item) => item.label);

  const step = periodKey === "max" || periodKey === "5y" ? 12 : 3;
  const ticks = series
    .filter((_item, index) => index === 0 || index === series.length - 1 || index % step === 0)
    .map((item) => item.label);

  return [...new Set(ticks)];
}

function PeriodTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-ink">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <p className="flex min-w-36 items-center gap-2" key={entry.dataKey}>
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-ink/62">{entry.dataKey === "strategy" ? "Strategy" : "Benchmark"}</span>
            <span className="ml-auto font-medium tabular-nums text-ink">
              {typeof entry.value === "number" ? formatPercent(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function PeriodPerformanceView({
  strategy,
  compact = false
}: {
  strategy: Strategy;
  compact?: boolean;
}) {
  const [activePeriod, setActivePeriod] = useState<PerformancePeriodKey>("1y");
  const periodReturns = useMemo(() => getPeriodReturns(strategy), [strategy]);
  const series = useMemo(
    () => getPeriodPerformanceSeries(strategy, activePeriod),
    [strategy, activePeriod]
  );
  const activePeriodLabel = performancePeriods.find((period) => period.key === activePeriod)?.label ?? "";
  const activePeriodReturn = periodReturns.find((period) => period.key === activePeriod);
  const dateRange = series.length > 0
    ? `${series[0].label} to ${series[series.length - 1].label}`
    : "";
  const chartTicks = useMemo(() => getChartTicks(series, activePeriod), [series, activePeriod]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {periodReturns.map((period) => {
          const direction = period.strategy === null || period.strategy === 0
            ? "neutral"
            : period.strategy > 0 ? "positive" : "negative";

          return (
            <button
              className={cn(
                "rounded border border-line bg-white p-4 text-left transition duration-180 hover:border-pine/40 hover:bg-paper",
                activePeriod === period.key && "border-gold/70 bg-paper shadow-sm"
              )}
              key={period.key}
              type="button"
              onClick={() => setActivePeriod(period.key)}
            >
              <span className="text-xs uppercase tracking-wide text-ink/52">{period.label}</span>
              <span
                className={cn(
                  "mt-2 flex items-center gap-1.5 text-2xl font-semibold tabular-nums",
                  direction === "positive" && "text-moss",
                  direction === "negative" && "text-clay",
                  direction === "neutral" && "text-ink"
                )}
              >
                {direction === "positive" && <TrendingUp size={16} className="shrink-0" aria-hidden="true" />}
                {direction === "negative" && <TrendingDown size={16} className="shrink-0" aria-hidden="true" />}
                {formatPercent(period.strategy)}
              </span>
              <span className="mt-1 block text-sm text-ink/62">
                {strategy.benchmark} {formatPercent(period.benchmark)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded border border-line bg-white p-4">
        {activePeriodReturn && (
          <div className="mb-4 grid gap-3 border-b border-line pb-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/52">Strategy return</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-moss">
                {formatPercent(activePeriodReturn.strategy)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/52">{strategy.benchmark}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {formatPercent(activePeriodReturn.benchmark)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/52">Max drawdown</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-clay">
                {formatPercent(activePeriodReturn.maxDrawdown)}
              </p>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>
              Cumulative Return
            </h3>
            <p className="text-sm text-ink/58">Strategy vs {strategy.benchmark}</p>
            {dateRange && (
              <p className="mt-1 text-xs font-medium text-ink/52">
                {activePeriodLabel}: {dateRange}
              </p>
            )}
          </div>
          <div className="inline-flex rounded border border-line bg-paper p-1">
            {performancePeriods.map((period) => (
              <button
                className={cn(
                  "rounded px-3 py-1.5 text-xs font-semibold text-ink/64 transition duration-180 hover:text-ink",
                  activePeriod === period.key && "bg-white text-ink shadow-sm"
                )}
                key={period.key}
                type="button"
                onClick={() => setActivePeriod(period.key)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {series.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="#eee7dc" />
                <XAxis
                  dataKey="label"
                  ticks={chartTicks}
                  interval={0}
                  minTickGap={16}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#18211f99", fontSize: 12 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: 12 }} />
                <Tooltip content={<PeriodTooltip />} cursor={{ stroke: "#1f3a33", strokeWidth: 1, strokeOpacity: 0.2 }} />
                <Line type="monotone" dataKey="strategy" stroke="#1f3a33" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="benchmark" stroke="#a55f45" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid h-72 place-items-center rounded bg-paper text-sm text-ink/58">
            Not enough history for this period.
          </div>
        )}
      </div>
    </div>
  );
}
