"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function MonthlyPerformanceChart({
  data
}: {
  data: Array<{ month: string; strategy: number; benchmark: number }>;
}) {
  if (!useMounted()) return <ChartSkeleton />;
  const reduceMotion = prefersReducedMotion();

  return (
    <div className="h-72 w-full rounded border border-line bg-white p-4">
      <ChartLegend />
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eee7dc" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#1f3a33", strokeWidth: 1, strokeOpacity: 0.2 }} />
          <Line
            type="monotone"
            dataKey="strategy"
            stroke="#1f3a33"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={!reduceMotion}
            animationDuration={motionDuration.slow}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            stroke="#a55f45"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={!reduceMotion}
            animationDuration={motionDuration.slow}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YearlyReturnChart({
  data
}: {
  data: Array<{ year: string; strategy: number; benchmark: number }>;
}) {
  if (!useMounted()) return <ChartSkeleton />;
  const reduceMotion = prefersReducedMotion();

  return (
    <div className="h-72 w-full rounded border border-line bg-white p-4">
      <ChartLegend />
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid stroke="#eee7dc" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#18211f99", fontSize: 12 }} />
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
