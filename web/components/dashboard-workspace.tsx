import Link from "next/link";
import type React from "react";
import { ArrowLeft, ArrowRight, Download, FileText, Layers3, Leaf, ShieldCheck } from "lucide-react";
import { DashboardTrackedLink } from "@/components/dashboard-analytics";
import {
  formatDashboardDate,
  formatWeight,
  getRebalanceCounts,
  getSectorWeights,
  type DashboardData,
  type DashboardStrategy
} from "@/lib/dashboard";

const dashboardNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/rebalances", label: "Rebalances" },
  { href: "/dashboard/research", label: "Research & Downloads" },
  { href: "/dashboard/account", label: "Account" }
];

export function DashboardLoginRequired() {
  return (
    <main className="container-page section">
      <section className="card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Subscriber workspace</p>
        <h1 className="mt-3 text-3xl font-semibold">Login required</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/68">
          Login identifies the viewer. Strategy model portfolio access is granted separately through
          an active subscription or admin-approved access grant.
        </p>
        <Link href="/login?next=/dashboard" className="btn-primary mt-5">
          Login
        </Link>
      </section>
    </main>
  );
}

export function DashboardShell({
  data,
  active,
  eyebrow,
  title,
  children
}: {
  data: DashboardData;
  active: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,rgba(195,155,67,0.09),transparent_34%),linear-gradient(180deg,#f7f4ef_0%,#fffaf4_42%,#f7f4ef_100%)]">
      <section className="container-page pt-8 sm:pt-10">
        <div className="rounded border border-pine/14 bg-[#fffaf4]/92 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">
                Welcome back, <span className="font-semibold text-ink">{data.firstName}</span>. {today}.
                This workspace shows Vriksha model portfolios and research access only, not your
                actual holdings or executed trades.
              </p>
            </div>
            <div className="rounded border border-line bg-white px-4 py-3 text-sm text-ink/70">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink/44">Account</span>
              <span className="mt-1 block font-medium text-ink">{data.email}</span>
            </div>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto border-t border-line pt-4" aria-label="Dashboard navigation">
            {dashboardNav.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                  active === item.href
                    ? "border-pine bg-pine text-white"
                    : "border-line bg-white text-ink/72 hover:border-pine/40 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="container-page py-8 sm:py-10">{children}</section>
    </main>
  );
}

export function ModelPortfolioBoundaryNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded border border-gold/35 bg-gold/10 ${compact ? "p-3" : "p-4"}`}>
      <p className="text-sm leading-6 text-ink/72">
        These are published Vriksha model portfolio weights. Vriksha does not hold, manage, or verify
        your capital here; execution remains client-directed with no POA and no automatic execution.
      </p>
    </div>
  );
}

export function StrategySelector({
  strategies,
  selectedSlug,
  basePath
}: {
  strategies: DashboardStrategy[];
  selectedSlug?: string;
  basePath: string;
}) {
  if (strategies.length <= 1) return null;
  return (
    <div className="flex gap-2 overflow-x-auto">
      {strategies.map((item) => (
        <Link
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
            item.strategy.slug === selectedSlug
              ? "border-pine bg-pine text-white"
              : "border-line bg-white text-ink/70 hover:border-pine/40 hover:text-ink"
          }`}
          href={`${basePath}?strategy=${item.strategy.slug}`}
          key={item.strategy.slug}
        >
          {item.strategy.name}
        </Link>
      ))}
    </div>
  );
}

export function EmptyDashboardState() {
  return (
    <section className="card p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">No active strategies</p>
      <h2 className="mt-2 text-2xl font-semibold">No model portfolio access is currently active</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/68">
        Active subscriptions or manual access grants will appear here with model holdings, rebalance
        notes, and subscriber downloads.
      </p>
      <Link href="/strategies" className="btn-primary mt-5">
        Browse strategies
      </Link>
    </section>
  );
}

export function AttentionPanel({ data }: { data: DashboardData }) {
  if (data.actions.length === 0) {
    return (
    <section className="rounded border border-pine/20 bg-pine/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-pine" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Everything is up to date</h2>
            <p className="mt-1 text-sm leading-6 text-ink/68">
              No immediate subscriber action is visible from current account and access data.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      {data.actions.map((action) => (
        <Link
        className={`rounded border p-5 shadow-xs hover:-translate-y-0.5 ${
            action.tone === "clay"
              ? "border-clay/30 bg-clay/10"
              : action.tone === "gold"
                ? "border-gold/35 bg-gold/10"
                : "border-pine/20 bg-pine/10"
          }`}
          href={action.href}
          key={action.title}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/46">Needs your attention</p>
          <h2 className="mt-2 text-lg font-semibold">{action.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">{action.body}</p>
        </Link>
      ))}
    </section>
  );
}

export function SummaryRow({ data }: { data: DashboardData }) {
  const latest = data.strategies
    .filter((item) => item.latestRebalance)
    .sort((a, b) => new Date(b.latestRebalance?.date ?? 0).getTime() - new Date(a.latestRebalance?.date ?? 0).getTime())[0];
  const totalHoldings = data.strategies.reduce((sum, item) => sum + item.holdingsCount, 0);
  const next = data.strategies
    .filter((item) => item.nextExpectedRebalance)
    .sort((a, b) => new Date(a.nextExpectedRebalance ?? 0).getTime() - new Date(b.nextExpectedRebalance ?? 0).getTime())[0];
  const cells = [
    { label: "Active strategies", value: data.strategies.length ? String(data.strategies.length) : "" },
    { label: "Latest rebalance", value: latest ? `${latest.strategy.name} · ${formatDashboardDate(latest.latestRebalance?.date)}` : "" },
    { label: "Model holdings tracked", value: totalHoldings ? String(totalHoldings) : "" },
    { label: "Next expected rebalance", value: next ? formatDashboardDate(next.nextExpectedRebalance) : "" },
    { label: "Nearest renewal", value: data.nearestRenewal ? formatDashboardDate(data.nearestRenewal) : "" }
  ].filter((item) => item.value);

  if (cells.length === 0) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cells.map((cell) => (
        <div className="rounded border border-line bg-white p-4 shadow-xs" key={cell.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/44">{cell.label}</p>
          <p className="mt-2 text-lg font-semibold text-ink">{cell.value}</p>
        </div>
      ))}
    </section>
  );
}

export function StrategyWorkspaceCard({ item }: { item: DashboardStrategy }) {
  return (
    <article className="relative overflow-hidden rounded-[18px_8px_18px_8px] border border-pine/16 bg-[#fffaf4] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pine/32 hover:bg-white">
      <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-[100%_0_100%_0] border border-gold/25" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-pine/20 bg-pine/10 px-3 py-1 text-xs font-semibold text-pine">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            {item.family} {item.edition}
          </span>
          <span className="rounded-full bg-gold/12 px-3 py-1 text-xs font-semibold text-ink/66">{item.status}</span>
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{item.strategy.name}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/66">{item.strategy.subtitle}</p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <InfoPill label="Expiry" value={formatDashboardDate(item.endsAt) || "Open-ended"} />
          <InfoPill label="Latest model" value={formatDashboardDate(item.latestModelDate) || "Published model"} />
          <InfoPill label="Latest rebalance" value={formatDashboardDate(item.latestRebalance?.date) || "No recent log"} />
          <InfoPill label="Holdings" value={`${item.holdingsCount} model names`} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <DashboardTrackedLink
            className="btn-primary"
            event="strategy_dashboard_opened"
            href={item.strategyPath}
            properties={{ strategySlug: item.strategy.slug, strategyFamily: item.family, source: "dashboard" }}
          >
            Open strategy <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </DashboardTrackedLink>
          <Link className="btn-secondary" href={`/dashboard/portfolio?strategy=${item.strategy.slug}`}>
            Model portfolio
          </Link>
          <Link className="btn-secondary" href={`/dashboard/rebalances?strategy=${item.strategy.slug}`}>
            Rebalance log
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PortfolioPreview({ item }: { item: DashboardStrategy }) {
  const sectors = getSectorWeights(item.strategy).slice(0, 5);
  return (
    <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Latest model portfolio</p>
        <h2 className="mt-2 text-2xl font-semibold">{item.strategy.name}</h2>
        <p className="mt-2 text-sm text-ink/64">
          Published {formatDashboardDate(item.latestModelDate) || "for subscribers"} · {item.holdingsCount} model holdings
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-ink/44">
              <tr>
                <th className="py-2 font-medium">Symbol</th>
                <th className="font-medium">Company</th>
                <th className="font-medium">Sector</th>
                <th className="font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {item.strategy.holdings.slice(0, 8).map((holding) => (
                <tr className="border-t border-line" key={holding.symbol}>
                  <td className="py-3 font-semibold text-pine">{holding.symbol}</td>
                  <td>{holding.company}</td>
                  <td>{holding.sector}</td>
                  <td>{formatWeight(holding.weight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Model allocation</p>
        <h2 className="mt-2 text-2xl font-semibold">Sector weights</h2>
        <div className="mt-5 space-y-3">
          {sectors.map((sector) => (
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
      </div>
    </section>
  );
}

export function RebalanceSummaryCard({ item }: { item: DashboardStrategy }) {
  const counts = getRebalanceCounts(item.latestRebalance);
  const totalChanges = counts.additions + counts.exits + counts.increases + counts.reductions;
  const actionLabel = item.reviewedAt
    ? "View reviewed rebalance"
    : totalChanges > 0
      ? `Review ${totalChanges} portfolio changes`
      : "View portfolio review";
  return (
    <section className="card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Latest rebalance</p>
          <h2 className="mt-2 text-2xl font-semibold">{item.strategy.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/68">
            {item.latestRebalance?.summary ?? "No recent rebalance log is available for this strategy."}
          </p>
        </div>
        <Link href={`/dashboard/rebalances?strategy=${item.strategy.slug}&view=guided`} className="btn-secondary">
          {actionLabel}
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <InfoPill label="Date" value={formatDashboardDate(item.latestRebalance?.date) || "No log"} />
        <InfoPill label="Additions" value={String(counts.additions)} />
        <InfoPill label="Increases" value={String(counts.increases)} />
        <InfoPill label="Reductions" value={String(counts.reductions)} />
        <InfoPill label="Exits" value={String(counts.exits)} />
      </div>
      <div className="mt-5 rounded border border-line bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            {item.reviewProgress.reviewedCount} of {item.reviewProgress.totalCount} changes reviewed
          </p>
          <p className="text-sm text-ink/58">{item.reviewedAt ? "Rebalance reviewed" : "Review pending"}</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.reviewProgress.percent}>
          <div className="h-2 rounded-full bg-pine" style={{ width: `${item.reviewProgress.percent}%` }} />
        </div>
      </div>
    </section>
  );
}

export function DashboardBackLink() {
  return (
    <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-pine hover:text-ink">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to overview
    </Link>
  );
}

export function DocumentIcon({ kind }: { kind: "portfolio" | "rebalance" | "strategy" }) {
  if (kind === "portfolio") return <Layers3 className="h-4 w-4" aria-hidden="true" />;
  if (kind === "rebalance") return <Download className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/44">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
