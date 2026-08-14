import { DashboardEventTracker } from "@/components/dashboard-analytics";
import {
  DashboardBackLink,
  DashboardLoginRequired,
  DashboardShell,
  EmptyDashboardState,
  StrategySelector
} from "@/components/dashboard-workspace";
import { RebalanceReviewWorkflow } from "@/components/rebalance-review-workflow";
import { getDashboardData, getSelectedDashboardStrategy } from "@/lib/dashboard";

export default async function DashboardRebalancesPage({
  searchParams
}: {
  searchParams: Promise<{ strategy?: string; view?: string }>;
}) {
  const data = await getDashboardData();
  if (!data.user) return <DashboardLoginRequired />;
  const params = await searchParams;
  const selected = getSelectedDashboardStrategy(data, params.strategy);
  const view = params.view === "comparison" || params.view === "full" ? params.view : "guided";

  return (
    <DashboardShell active="/dashboard/rebalances" data={data} eyebrow="Rebalance centre" title="Model Rebalances">
      <DashboardEventTracker event="rebalance_opened" properties={{ strategySlug: selected?.strategy.slug, source: "dashboard_rebalances" }} />
      {data.strategies.length === 0 || !selected ? (
        <EmptyDashboardState />
      ) : (
        <div className="space-y-6">
          <DashboardBackLink />
          <StrategySelector basePath="/dashboard/rebalances" selectedSlug={selected.strategy.slug} strategies={data.strategies} />
          <RebalanceReviewWorkflow
            initialView={view}
            item={selected}
            reviewCsvHref={selected.strategy.exports?.rebalanceHistoryCsv}
          />
        </div>
      )}
    </DashboardShell>
  );
}
