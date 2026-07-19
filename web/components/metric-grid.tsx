import type { StrategyMetric } from "@/lib/types";

export function MetricGrid({ metrics }: { metrics: StrategyMetric[] }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <div className="metric-cell" key={metric.label}>
          <p className="text-xs uppercase tracking-wide text-ink/52">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{metric.value}</p>
          <p className="mt-1 text-sm text-ink/62">{metric.hint}</p>
        </div>
      ))}
    </div>
  );
}
