"use client";

import { useEffect, useMemo, useState } from "react";
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
  const isNarrow = useNarrowViewport();
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
  const chartTicks = useMemo(() => {
    const ticks = getChartTicks(series, activePeriod);
    if (!isNarrow || ticks.length <= 3) return ticks;
    return ticks.filter((_tick, index) => index === 0 || index === ticks.length - 1 || index === Math.floor(ticks.length / 2));
  }, [series, activePeriod, isNarrow]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-5">
        {periodReturns.map((period) => {
          const direction = period.strategy === null || period.strategy === 0
            ? "neutral"
            : period.strategy > 0 ? "positive" : "negative";

          return (
            <button
              className={cn(
                "min-h-[94px] rounded border border-line bg-white p-3 text-left transition duration-180 hover:border-pine/40 hover:bg-paper sm:min-h-[124px] sm:p-4",
                activePeriod === period.key && "border-gold/70 bg-paper shadow-sm"
              )}
              key={period.key}
              type="button"
              onClick={() => setActivePeriod(period.key)}
            >
              <span className="text-[10px] uppercase tracking-wide text-ink/52 sm:text-xs">{period.label}</span>
              <span
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-lg font-semibold tabular-nums sm:mt-2 sm:gap-1.5 sm:text-2xl",
                  direction === "positive" && "text-moss",
                  direction === "negative" && "text-clay",
                  direction === "neutral" && "text-ink"
                )}
              >
                {direction === "positive" && <TrendingUp size={14} className="shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />}
                {direction === "negative" && <TrendingDown size={14} className="shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />}
                {formatPercent(period.strategy)}
              </span>
              <span className="mt-1 block text-[11px] leading-4 text-ink/62 sm:text-sm sm:leading-5">
                {strategy.benchmark} {formatPercent(period.benchmark)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded border border-line bg-white p-3 sm:p-4">
        {activePeriodReturn && (
          <div className="mb-4 grid grid-cols-3 gap-2 border-b border-line pb-4 sm:gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/52 sm:text-xs">Backtest return</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-moss sm:text-lg">
                {formatPercent(activePeriodReturn.strategy)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/52 sm:text-xs">CAGR (1Y+)</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-ink sm:text-lg">
                {activePeriodReturn.monthsUsed < 12 ? "NA" : formatPercent(activePeriodReturn.cagr)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/52 sm:text-xs">Max drawdown</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-clay sm:text-lg">
                {formatPercent(activePeriodReturn.maxDrawdown)}
              </p>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>
              Cumulative Backtest Return
            </h3>
            <p className="text-sm text-ink/58">Strategy vs {strategy.benchmark}</p>
            {dateRange && (
              <p className="mt-1 text-xs font-medium text-ink/52">
                {activePeriodLabel}: {dateRange}
              </p>
            )}
          </div>
          <div className="grid grid-cols-5 rounded border border-line bg-paper p-1 sm:inline-flex">
            {performancePeriods.map((period) => (
              <button
                className={cn(
                  "rounded px-2 py-1.5 text-[11px] font-semibold text-ink/64 transition duration-180 hover:text-ink sm:px-3 sm:text-xs",
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
          <div className="h-56 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: isNarrow ? 4 : 16, bottom: 0, left: isNarrow ? -24 : 0 }}>
                <CartesianGrid stroke="#eee7dc" />
                <XAxis
                  dataKey="label"
                  ticks={chartTicks}
                  interval={0}
                  minTickGap={isNarrow ? 28 : 16}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#18211f99", fontSize: isNarrow ? 10 : 12 }}
                />
                <YAxis width={isNarrow ? 32 : 44} tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: isNarrow ? 10 : 12 }} />
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
