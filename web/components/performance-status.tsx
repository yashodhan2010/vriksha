import type { Strategy } from "@/lib/types";

export function PerformanceStatus({ strategy }: { strategy: Strategy }) {
  return (
    <div className="space-y-1 text-xs leading-5" role="status">
      {strategy.performanceStatus === "internal_preview" && (
        <p className="font-semibold text-clay">
          Internal preview - Unapproved model performance. Latest rebalance target weights are applied daily; holdings do
          not drift between rebalances. Not broker returns or approved public performance.
        </p>
      )}
      {strategy.performanceStatus === "unavailable" && (
        <p className="font-semibold text-clay">Live model history unavailable. Showing Backtest only; no live returns substituted.</p>
      )}
      {strategy.transitionDate ? (
        <p>Backtest through {strategy.transitionDate} - Live model strictly after {strategy.transitionDate}</p>
      ) : (
        <p>Backtest</p>
      )}
      {strategy.updatedThrough && <p>Updated through {strategy.updatedThrough}</p>}
    </div>
  );
}
