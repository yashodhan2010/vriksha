import { DashboardEventTracker, DashboardTrackedLink } from "@/components/dashboard-analytics";
import {
  DashboardBackLink,
  DashboardLoginRequired,
  DashboardShell,
  EmptyDashboardState,
  ModelPortfolioBoundaryNote,
  StrategySelector
} from "@/components/dashboard-workspace";
import { formatDashboardDate, formatWeight, getDashboardData, getPortfolioRows, getSelectedDashboardStrategy, getSectorWeights } from "@/lib/dashboard";

export default async function DashboardPortfolioPage({
  searchParams
}: {
  searchParams: Promise<{ strategy?: string }>;
}) {
  const data = await getDashboardData();
  if (!data.user) return <DashboardLoginRequired />;
  const params = await searchParams;
  const selected = getSelectedDashboardStrategy(data, params.strategy);

  return (
    <DashboardShell active="/dashboard/portfolio" data={data} eyebrow="Model portfolio" title="Portfolio Workspace">
      <DashboardEventTracker event="portfolio_viewed" properties={{ strategySlug: selected?.strategy.slug, source: "dashboard_portfolio" }} />
      {data.strategies.length === 0 || !selected ? (
        <EmptyDashboardState />
      ) : (
        <div className="space-y-6">
          <DashboardBackLink />
          <StrategySelector basePath="/dashboard/portfolio" selectedSlug={selected.strategy.slug} strategies={data.strategies} />
          <ModelPortfolioBoundaryNote />
          <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Latest model portfolio</p>
                  <h2 className="mt-2 text-2xl font-semibold">{selected.strategy.name}</h2>
                  <p className="mt-2 text-sm text-ink/64">
                    Published {formatDashboardDate(selected.latestModelDate) || "for subscribers"} · {selected.holdingsCount} model holdings
                  </p>
                </div>
                {selected.strategy.exports?.latestModelPortfolioCsv && (
                  <DashboardTrackedLink
                    className="btn-primary"
                    download
                    event="portfolio_downloaded"
                    href={selected.strategy.exports.latestModelPortfolioCsv}
                    properties={{ strategySlug: selected.strategy.slug, source: "dashboard_portfolio" }}
                  >
                    Download CSV
                  </DashboardTrackedLink>
                )}
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-ink/44">
                    <tr>
                      <th className="py-2 font-medium">Symbol</th>
                      <th className="font-medium">Company</th>
                      <th className="font-medium">Sector</th>
                      <th className="font-medium">Current target</th>
                      <th className="font-medium">Previous weight</th>
                      <th className="font-medium">Change</th>
                      <th className="font-medium">Status</th>
                      <th className="font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPortfolioRows(selected.strategy).map((holding) => (
                      <tr className="border-t border-line align-top" key={holding.symbol}>
                        <td className="py-3 font-semibold text-pine">{holding.symbol}</td>
                        <td>{holding.company}</td>
                        <td>{holding.sector}</td>
                        <td>{formatWeight(holding.weight)}</td>
                        <td>{formatWeight(holding.previousWeight)}</td>
                        <td className={holding.change >= 0 ? "text-pine" : "text-clay"}>{holding.change === 0 ? "0.00%" : formatWeight(holding.change)}</td>
                        <td>{holding.changeStatus}</td>
                        <td className="max-w-[260px] text-ink/62">{holding.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <aside className="card h-fit p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Allocation view</p>
              <h2 className="mt-2 text-2xl font-semibold">Sector model weights</h2>
              <div className="mt-5 space-y-3">
                {getSectorWeights(selected.strategy).map((sector) => (
                  <div key={sector.sector}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{sector.sector}</span>
                      <span className="text-ink/64">{formatWeight(sector.weight)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-line">
                      <div className="h-2 rounded-full bg-pine" style={{ width: `${Math.min(sector.weight * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
