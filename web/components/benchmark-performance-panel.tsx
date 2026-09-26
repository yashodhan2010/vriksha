"use client";

import { useMemo, useState } from "react";
import { BacktestReturnMatrix } from "@/components/performance-chart";
import { PeriodPerformanceView } from "@/components/period-performance-view";
import {
  applyBenchmarkComparison,
  findBenchmarkComparison,
  getSelectedBenchmarkLabel,
  selectableBenchmarks
} from "@/lib/benchmark-selection";
import type { Strategy } from "@/lib/types";

export function BenchmarkPerformancePanel({ strategy }: { strategy: Strategy }) {
  const [selectedBenchmark, setSelectedBenchmark] = useState(() => getSelectedBenchmarkLabel(strategy));
  const effectiveBenchmark = getSelectedBenchmarkLabel(strategy, selectedBenchmark);
  const selectedStrategy = useMemo(
    () => applyBenchmarkComparison(strategy, effectiveBenchmark),
    [strategy, effectiveBenchmark]
  );
  const availableCount = selectableBenchmarks.filter((label) => findBenchmarkComparison(strategy, label)).length;

  return (
    <div className="space-y-8">
      <div className="rounded border border-line bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52" htmlFor={`benchmark-${strategy.slug}`}>
              Compare with
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink outline-none transition duration-180 focus:border-pine sm:w-72"
              id={`benchmark-${strategy.slug}`}
              value={effectiveBenchmark}
              onChange={(event) => setSelectedBenchmark(event.target.value)}
            >
              {selectableBenchmarks.map((label) => {
                const comparison = findBenchmarkComparison(strategy, label);
                return (
                  <option disabled={!comparison} key={label} value={label}>
                    {label}{comparison ? "" : " - not imported"}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="max-w-xl text-xs leading-5 text-ink/58">
            Benchmark choices appear when their daily, monthly and yearly series are imported with the strategy package.
            {availableCount === 1 ? " Only the current package benchmark is available right now." : ""}
          </p>
        </div>
      </div>

      <PeriodPerformanceView strategy={selectedStrategy} />
      <BacktestReturnMatrix
        monthlyData={selectedStrategy.monthlyReturns}
        yearlyData={selectedStrategy.yearlyReturns}
        benchmark={selectedStrategy.benchmark}
        transitionDate={selectedStrategy.transitionDate}
        updatedThrough={selectedStrategy.updatedThrough}
      />
    </div>
  );
}

