import { DashboardEventTracker, DashboardTrackedLink } from "@/components/dashboard-analytics";
import {
  DashboardBackLink,
  DashboardLoginRequired,
  DashboardShell,
  DocumentIcon,
  EmptyDashboardState
} from "@/components/dashboard-workspace";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardResearchPage() {
  const data = await getDashboardData();
  if (!data.user) return <DashboardLoginRequired />;

  return (
    <DashboardShell active="/dashboard/research" data={data} eyebrow="Research & downloads" title="Subscriber Research Desk">
      <DashboardEventTracker event="research_document_opened" properties={{ source: "dashboard_research_view" }} />
      {data.strategies.length === 0 ? (
        <EmptyDashboardState />
      ) : (
        <div className="space-y-6">
          <DashboardBackLink />
          <section className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Subscriber documents</p>
            <h2 className="mt-2 text-2xl font-semibold">Strategy files and model downloads</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">
              This desk lists documents tied to your active model portfolio access. Public blog notes
              remain separate unless clearly labelled as public research.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {data.documents.map((document) => (
                <DashboardTrackedLink
                  className="rounded border border-line bg-white p-4 shadow-xs hover:-translate-y-0.5 hover:border-pine/28"
                  event={document.kind === "portfolio" || document.kind === "rebalance" ? "portfolio_downloaded" : "research_document_opened"}
                  href={document.href}
                  key={`${document.strategySlug}-${document.kind}-${document.title}`}
                  properties={{ strategySlug: document.strategySlug, source: "dashboard_research", destination: document.href }}
                >
                  <div className="flex items-start gap-3">
                    <span className="icon-chip">
                      <DocumentIcon kind={document.kind} />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/44">
                        {document.strategyName}
                      </span>
                      <span className="mt-1 block font-semibold text-ink">{document.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-ink/64">{document.description}</span>
                    </span>
                  </div>
                </DashboardTrackedLink>
              ))}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
