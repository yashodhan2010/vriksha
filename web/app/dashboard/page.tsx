import { DashboardEventTracker } from "@/components/dashboard-analytics";
import {
  AttentionPanel,
  DashboardLoginRequired,
  DashboardShell,
  EmptyDashboardState,
  ModelPortfolioBoundaryNote,
  PortfolioPreview,
  RebalanceSummaryCard,
  StrategyWorkspaceCard,
  SummaryRow
} from "@/components/dashboard-workspace";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.user) {
    return <DashboardLoginRequired />;
  }

  const latest = data.strategies
    .filter((item) => item.latestRebalance)
    .sort((a, b) => new Date(b.latestRebalance?.date ?? 0).getTime() - new Date(a.latestRebalance?.date ?? 0).getTime())[0];

  return (
    <DashboardShell active="/dashboard" data={data} eyebrow="Subscriber workspace" title="Client Dashboard">
      <DashboardEventTracker event="dashboard_viewed" properties={{ source: "dashboard_overview" }} />
      {data.strategies.length === 0 ? (
        <EmptyDashboardState />
      ) : (
        <div className="space-y-6">
          <AttentionPanel data={data} />
          <SummaryRow data={data} />
          <ModelPortfolioBoundaryNote />
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">My strategies</p>
                <h2 className="mt-2 text-2xl font-semibold">Active model portfolio access</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-ink/62">
                Holdings below are Vriksha model portfolio outputs, not your actual broker holdings.
              </p>
            </div>
            <div className="grid gap-4">
              {data.strategies.map((item) => (
                <StrategyWorkspaceCard item={item} key={item.strategy.slug} />
              ))}
            </div>
          </section>
          {latest && (
            <>
              <RebalanceSummaryCard item={latest} />
              <PortfolioPreview item={latest} />
            </>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
