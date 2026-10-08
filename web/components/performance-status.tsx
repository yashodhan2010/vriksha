import type { Strategy } from "@/lib/types";

export function PerformanceStatus({ strategy }: { strategy: Strategy }) {
  return (
    <div className="space-y-1 text-xs leading-5" role="status">
      {strategy.performanceStatus === "unavailable" ? (
        <p>Live model unavailable - Backtest through {strategy.updatedThrough ?? "latest imported date"}</p>
      ) : strategy.transitionDate ? (
        <p>Backtest through {strategy.transitionDate} - Live model strictly after {strategy.transitionDate}</p>
      ) : (
        <p>Backtest</p>
      )}
    </div>
  );
}
