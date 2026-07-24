import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StrategyMetric } from "@/lib/types";

// Only metrics that describe a return/growth/decline are given a directional
// treatment. Neutral stats (Sharpe, turnover, holding count, etc.) are left
// unstyled so we never imply a "gain" or "loss" on a number that isn't one.
const directionalLabel = /cagr|return|growth|drawdown|loss|gain/i;

function getDirection(label: string, value: string): "positive" | "negative" | "neutral" {
  if (!directionalLabel.test(label)) return "neutral";
  const numeric = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric) || numeric === 0) return "neutral";
  return numeric > 0 ? "positive" : "negative";
}

export function MetricGrid({ metrics }: { metrics: StrategyMetric[] }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => {
        const direction = getDirection(metric.label, metric.value);
        return (
          <div className="metric-cell" key={metric.label}>
            <p className="text-xs uppercase tracking-wide text-ink/52">{metric.label}</p>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-2xl font-semibold tabular-nums",
                direction === "positive" && "text-moss",
                direction === "negative" && "text-clay",
                direction === "neutral" && "text-ink"
              )}
            >
              {direction === "positive" && <TrendingUp size={16} className="shrink-0" aria-hidden="true" />}
              {direction === "negative" && <TrendingDown size={16} className="shrink-0" aria-hidden="true" />}
              <span className="sr-only">
                {direction === "positive" ? "Positive: " : direction === "negative" ? "Negative: " : ""}
              </span>
              <span>{metric.value}</span>
            </p>
            <p className="mt-1 text-sm text-ink/62">{metric.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
