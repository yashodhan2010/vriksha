import { DashboardEventTracker } from "@/components/dashboard-analytics";
import {
  AttentionPanel,
  DashboardLoginRequired,
  DashboardShell,
  EmptyDashboardState,
  KycStatusPanel,
  ModelPortfolioBoundaryNote,
  PortfolioPreview,
  RebalanceSummaryCard,
  StrategyWorkspaceCard,
  SummaryRow
} from "@/components/dashboard-workspace";
import { KycForm } from "@/components/kyc-form";
import { getDashboardData } from "@/lib/dashboard";
import type { KycStatus } from "@/lib/kyc";

const clientActionableKycStatuses = new Set<string | null>([
  null,
  "not_started",
  "needs_resubmission",
  "rejected"
]);

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data.user) {
    return <DashboardLoginRequired />;
  }

  const latest = data.strategies
    .filter((item) => item.latestRebalance)
    .sort((a, b) => new Date(b.latestRebalance?.date ?? 0).getTime() - new Date(a.latestRebalance?.date ?? 0).getTime())[0];
  const canSubmitKyc = clientActionableKycStatuses.has(data.kycStatus);

  return (
    <DashboardShell active="/dashboard" data={data} eyebrow="Subscriber workspace" title="Client Dashboard">
      <DashboardEventTracker event="dashboard_viewed" properties={{ source: "dashboard_overview" }} />
      <div className="space-y-6">
        <KycStatusPanel data={data} />
        {canSubmitKyc && (
          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Client onboarding</p>
              <h2 className="mt-2 text-2xl font-semibold">Complete KYC verification</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">
                Submit the required details and documents here. The admin review queue remains separate
                for compliance verification.
              </p>
            </div>
            <KycForm initialStatus={data.kycStatus as KycStatus | null} />
          </section>
        )}
        {data.strategies.length === 0 ? (
          <EmptyDashboardState />
        ) : (
          <>
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
          </>
        )}
      </div>
    </DashboardShell>
  );
}
