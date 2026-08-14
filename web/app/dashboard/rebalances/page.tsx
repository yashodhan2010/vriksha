import { DashboardEventTracker, DashboardTrackedLink } from "@/components/dashboard-analytics";
import {
  DashboardBackLink,
  DashboardLoginRequired,
  DashboardShell,
  EmptyDashboardState,
  ModelPortfolioBoundaryNote,
  StrategySelector
} from "@/components/dashboard-workspace";
import { formatDashboardDate, formatWeight, getDashboardData, getRebalanceCounts, getSelectedDashboardStrategy } from "@/lib/dashboard";

export default async function DashboardRebalancesPage({
  searchParams
}: {
  searchParams: Promise<{ strategy?: string }>;
}) {
  const data = await getDashboardData();
  if (!data.user) return <DashboardLoginRequired />;
  const params = await searchParams;
  const selected = getSelectedDashboardStrategy(data, params.strategy);
  const latest = selected?.latestRebalance ?? null;
  const counts = getRebalanceCounts(latest);

  return (
    <DashboardShell active="/dashboard/rebalances" data={data} eyebrow="Rebalance centre" title="Model Rebalances">
      <DashboardEventTracker event="rebalance_opened" properties={{ strategySlug: selected?.strategy.slug, source: "dashboard_rebalances" }} />
      {data.strategies.length === 0 || !selected ? (
        <EmptyDashboardState />
      ) : (
        <div className="space-y-6">
          <DashboardBackLink />
          <StrategySelector basePath="/dashboard/rebalances" selectedSlug={selected.strategy.slug} strategies={data.strategies} />
          <ModelPortfolioBoundaryNote />
          <section className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Latest requiring review</p>
                <h2 className="mt-2 text-2xl font-semibold">{selected.strategy.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">
                  {latest?.summary ?? "No rebalance log is available for this model portfolio."}
                </p>
              </div>
              {selected.strategy.exports?.rebalanceHistoryCsv && (
                <DashboardTrackedLink
                  className="btn-secondary"
                  download
                  event="portfolio_downloaded"
                  href={selected.strategy.exports.rebalanceHistoryCsv}
                  properties={{ strategySlug: selected.strategy.slug, source: "dashboard_rebalances" }}
                >
                  Download history
                </DashboardTrackedLink>
              )}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Date", formatDashboardDate(latest?.date) || "No log"],
                ["Additions", String(counts.additions)],
                ["Increases", String(counts.increases)],
                ["Reductions", String(counts.reductions)],
                ["Exits", String(counts.exits)]
              ].map(([label, value]) => (
                <div className="rounded border border-line bg-white p-3" key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/44">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded border border-line bg-white p-3 text-sm leading-6 text-ink/64">
              Review status tracking is not configured in the current dashboard schema, so this page does
              not mark rebalances as reviewed. Use the published change log for client-directed execution review.
            </p>
          </section>
          {latest && (
            <section className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Change table</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-ink/44">
                    <tr>
                      <th className="py-2 font-medium">Symbol</th>
                      <th className="font-medium">Action</th>
                      <th className="font-medium">Previous weight</th>
                      <th className="font-medium">New target</th>
                      <th className="font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.changes.map((change) => (
                      <tr className="border-t border-line" key={`${latest.date}-${change.symbol}-${change.action}`}>
                        <td className="py-3 font-semibold text-pine">{change.symbol}</td>
                        <td>{change.action}</td>
                        <td>{formatWeight(change.oldWeight)}</td>
                        <td>{formatWeight(change.newWeight)}</td>
                        <td className={change.newWeight - change.oldWeight >= 0 ? "text-pine" : "text-clay"}>
                          {formatWeight(change.newWeight - change.oldWeight)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">History</p>
            <div className="mt-4 space-y-3">
              {selected.strategy.rebalances.map((rebalance) => (
                <article className="rounded border border-line bg-white p-4" key={rebalance.date}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-pine">{formatDashboardDate(rebalance.date)}</p>
                    <p className="text-sm text-ink/54">{rebalance.changes.length} model changes</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/68">{rebalance.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
