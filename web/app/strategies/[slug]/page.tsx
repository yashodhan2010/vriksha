import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Info,
  ListChecks,
} from "lucide-react";
import { Paywall } from "@/components/paywall";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";
import { PortfolioAllocationPlanner } from "@/components/portfolio-allocation-planner";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategy, getStrategyPerformancePath, getSubscribePath } from "@/lib/data";
import { hasStrategyAccess } from "@/lib/access";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "@/lib/strategy-taxonomy";
import type { PortfolioHolding, Rebalance, Strategy } from "@/lib/types";

function DetailCard({
  label,
  value,
  children
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded border border-line bg-[#fffaf4] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">{label}</p>
      {value && <p className="mt-2 text-sm font-semibold text-ink">{value}</p>}
      {children}
    </div>
  );
}

function getMinimumCapitalLabel(value: string) {
  const match = value.match(/(?:INR|Rs\.?|₹)?\s*([0-9,]+)(?:\s*lakh|\s*L)?/i);
  if (!match) return "₹1,00,000";

  if (/lakh|L/i.test(value) && match[1] === "1") return "₹1,00,000";
  return `₹${match[1]}`;
}

function SidebarSummaryTiles({
  price,
  minimumCapital
}: {
  price: string;
  minimumCapital: string;
}) {
  const tileClass = "rounded bg-paper/80 p-4 min-h-[132px]";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46";
  const valueClass = "mt-3 text-lg font-semibold leading-tight text-ink";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={tileClass}>
        <p className={labelClass}>Pricing</p>
        <p className={valueClass}>
          {price}
          <span className="text-sm font-medium text-ink/62">/month</span>
        </p>
      </div>
      <div className={tileClass}>
        <p className={labelClass}>Capital</p>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-ink/52">Minimum</p>
            <p className="mt-0.5 text-base font-semibold leading-tight text-ink">{minimumCapital}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink/52">Recommended</p>
            <p className="mt-0.5 text-base font-semibold leading-tight text-ink">₹5,00,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopHoldingsGlimpse({ holdings }: { holdings: PortfolioHolding[] }) {
  const topHoldings = [...holdings].sort((a, b) => b.weight - a.weight).slice(0, 5);

  return (
    <div className="rounded border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">Model Portfolio Glimpse</p>
          <h2 className="mt-1 text-lg font-semibold">Top 5 holdings</h2>
        </div>
        <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/58">
          Preview
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {topHoldings.map((holding) => (
          <div
            className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[minmax(0,1fr)_140px_72px] sm:items-center"
            key={holding.symbol}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{holding.symbol}</p>
              <p className="mt-1 truncate text-sm text-ink/72">{holding.company}</p>
            </div>
            <div className="min-w-0">
              <span className="inline-flex max-w-full rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink/64">
                <span className="truncate">{holding.sector}</span>
              </span>
            </div>
            <div className="text-sm font-semibold tabular-nums text-ink sm:text-right">
              {(holding.weight * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      {holdings.length > topHoldings.length && (
        <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-ink/58">
          Full target weights, notes, CSV export, and rebalance trail remain subscriber-only.
        </p>
      )}
    </div>
  );
}

function formatRebalanceDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getReportId(strategy: Strategy, date: string) {
  const code = strategy.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return `RPT-${code}-${date.replaceAll("-", "")}`;
}

function getRebalanceTitle(rebalance: Rebalance) {
  const added = rebalance.changes.find((change) => change.action === "Added");
  const removed = rebalance.changes.find((change) => change.action === "Removed");

  if (added && removed) {
    return `Exit: ${removed.symbol}, Entry: ${added.symbol} (${(added.newWeight * 100).toFixed(1)}%)`;
  }

  if (added) return `Entry: ${added.symbol} (${(added.newWeight * 100).toFixed(1)}%)`;
  if (removed) return `Exit: ${removed.symbol}`;

  return `Re-weight: ${rebalance.changes.length} name${rebalance.changes.length === 1 ? "" : "s"} adjusted`;
}

function RecentRebalances({ strategy }: { strategy: Strategy }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Recent Rebalances</h2>
        {strategy.exports?.rebalanceHistoryCsv && (
          <a
            className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-medium text-white"
            href={strategy.exports.rebalanceHistoryCsv}
          >
            <Download size={15} aria-hidden="true" />
            CSV
          </a>
        )}
      </div>
      <div className="mt-4 space-y-4">
        {strategy.rebalances.slice(0, 5).map((rebalance) => (
          <article className="rounded border border-line bg-white p-5 sm:p-6" key={rebalance.date}>
            <div className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine text-white">
                <Clock3 size={17} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-pine">{formatRebalanceDate(rebalance.date)}</p>
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-ink/72">
                    {getReportId(strategy, rebalance.date)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{getRebalanceTitle(rebalance)}</p>
                <p className="mt-1 text-sm leading-6 text-ink/58">{rebalance.summary}</p>
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pine underline underline-offset-4"
                  href="#"
                >
                  Research Report PDF
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default async function StrategyDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();

  const canViewPortfolio = await hasStrategyAccess(strategy.slug);
  const family = getFamilyMeta(getStrategyFamily(strategy));
  const edition = getEditionMeta(getStrategyEdition(strategy));
  const monthlyPrice = getStrategyPrice(strategy.slug, "monthly");
  const minimumCapital = getMinimumCapitalLabel(strategy.minCapital);
  const methodologySummary = strategy.methodologySections?.[0]?.body ?? strategy.methodology[0] ?? strategy.subtitle;
  const riskCards = (strategy.keyRisks ?? []).slice(0, 6);

  return (
    <main className="bg-[#f7f4ef]">
      <div className="mx-auto max-w-[1440px]">
        <Link
          href="/strategies"
          className="mx-4 mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 hover:border-pine/40 hover:text-pine sm:mx-6 lg:mx-8"
          aria-label="Back to all strategies"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All strategies
        </Link>

        <section className="mt-5 grid items-start gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 overflow-hidden rounded border border-line bg-[#fffaf4]">
            <div className="px-4 py-10 sm:px-8 lg:px-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Benchmark: {strategy.benchmark}
                </span>
                <span className="rounded-full border border-pine/20 bg-pine/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pine">
                  {family.label}
                </span>
                <span className="rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70">
                  {edition.label}
                </span>
              </div>

              <div className="mt-5 flex max-w-3xl items-start gap-3">
                <h1 className="text-4xl font-semibold text-pine sm:text-5xl">{strategy.name}</h1>
                <span className="group relative mt-2 inline-flex">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-pine"
                    aria-label="What this strategy does and does not do"
                    role="img"
                  >
                    <Info size={16} aria-hidden="true" />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-10 z-20 w-80 -translate-x-1/2 rounded border border-line bg-white p-4 text-sm leading-6 text-ink/72 opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <strong className="block text-ink">What it does</strong>
                    {methodologySummary}
                    <strong className="mt-3 block text-ink">What it does not do</strong>
                    It does not provide stock tips, guarantee returns, or execute trades on your behalf.
                  </span>
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink/68">{strategy.subtitle}</p>
            </div>

            <div className="px-4 pb-10 sm:px-8 lg:px-10">
              <section className="strategy-tabs rounded border border-line bg-white p-4 sm:p-5">
                <input className="strategy-tab-input" defaultChecked id="tab-overview" name="strategy-tabs" type="radio" />
                <input className="strategy-tab-input" id="tab-methodology" name="strategy-tabs" type="radio" />
                <input className="strategy-tab-input" id="tab-holdings" name="strategy-tabs" type="radio" />
                <input className="strategy-tab-input" id="tab-rebalances" name="strategy-tabs" type="radio" />
                <input className="strategy-tab-input" id="tab-disclosures" name="strategy-tabs" type="radio" />

                <div className="strategy-tab-list" role="tablist" aria-label="Strategy details">
                  <label className="strategy-tab-label" htmlFor="tab-overview" role="tab">Overview</label>
                  <label className="strategy-tab-label" htmlFor="tab-methodology" role="tab">Methodology</label>
                  <label className="strategy-tab-label" htmlFor="tab-holdings" role="tab">Holdings</label>
                  <label className="strategy-tab-label" htmlFor="tab-rebalances" role="tab">Rebalances</label>
                  <label className="strategy-tab-label" htmlFor="tab-disclosures" role="tab">Disclosures</label>
                </div>

                <div className="strategy-tab-panel strategy-tab-overview">
                  <section className="grid gap-4 md:grid-cols-3">
                    <DetailCard label="Universe" value={strategy.universe} />
                    <DetailCard label="Target Holdings" value={`${strategy.targetHoldings}`} />
                    <DetailCard label="Rebalance" value={strategy.rebalanceFrequency} />
                  </section>

                  {riskCards.length > 0 && (
                    <section className="mt-8">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-clay" aria-hidden="true" />
                        <h2 className="text-xl font-semibold">Risks</h2>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {riskCards.map((risk) => {
                          const [title, body] = risk.includes(":") ? risk.split(/:\s(.+)/) : ["Risk", risk];
                          return (
                            <article className="rounded border border-line bg-paper p-5" key={risk}>
                              <h3 className="text-sm font-semibold">{title}</h3>
                              <p className="mt-2 text-sm leading-6 text-ink/62">{body}</p>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                <div className="strategy-tab-panel strategy-tab-methodology">
                  <div className="flex items-center gap-2">
                    <ListChecks size={18} className="text-pine" aria-hidden="true" />
                    <h2 className="text-xl font-semibold">Methodology</h2>
                  </div>
                  {strategy.methodologySections && strategy.methodologySections.length > 0 ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {strategy.methodologySections.map((section) => (
                        <article className="rounded border border-line bg-[#fffaf4] p-5" key={section.title}>
                          <h3 className="font-semibold">{section.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-ink/68">{section.body}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {strategy.methodology.map((item) => (
                        <article className="rounded border border-line bg-[#fffaf4] p-5 text-sm leading-6 text-ink/72" key={item}>
                          {item}
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className="strategy-tab-panel strategy-tab-holdings">
                  <TopHoldingsGlimpse holdings={strategy.holdings} />
                  <div className="mt-5">
                    {canViewPortfolio ? (
                      <PortfolioAllocationPlanner
                        csvHref={strategy.exports?.latestModelPortfolioCsv}
                        holdings={strategy.holdings}
                        strategyName={strategy.name}
                        strategySlug={strategy.slug}
                      />
                    ) : (
                      <Paywall slug={strategy.slug} />
                    )}
                  </div>
                </div>

                <div className="strategy-tab-panel strategy-tab-rebalances">
                  {canViewPortfolio ? (
                    <RecentRebalances strategy={strategy} />
                  ) : (
                    <Paywall slug={strategy.slug} />
                  )}
                </div>

                <div className="strategy-tab-panel strategy-tab-disclosures">
                  <RegistrationDisclosureBlock suitability={strategy.suitability} targetInvestor={strategy.targetInvestor} />
                </div>
              </section>
            </div>
          </div>

          <aside className="rounded border border-line bg-white px-4 py-6 shadow-xs sm:px-6 xl:px-7">
            <div className="space-y-5">
              <SidebarSummaryTiles
                price={formatMoney(monthlyPrice.amountPaise)}
                minimumCapital={minimumCapital}
              />
              <p className="text-xs leading-5 text-ink/58">
                RA Name: {strategy.raName} - {strategy.sebiRegistration} - Deposit ₹1,00,000 lien marked
              </p>
              <a
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-pine bg-white px-4 py-3 text-sm font-semibold text-pine hover:bg-pine hover:text-white"
                href={getStrategyPerformancePath(strategy)}
              >
                <FileText size={16} aria-hidden="true" />
                View Model Portfolio Report PDF
              </a>

              <PerformanceDisclosureGate
                acknowledgementKey={`strategy:${strategy.slug}`}
                className="performance-gate-compact"
                compact
              >
                <div className="rounded border border-line bg-paper p-4" id="performance-access">
                  <p className="text-sm font-semibold text-ink">Backtest performance access recorded</p>
                  <p className="mt-2 text-xs leading-5 text-ink/58">
                    Your acknowledgement is active for this browser session. Performance details remain on the dedicated backtest page.
                  </p>
                  <Link
                    className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-ink"
                    href={getStrategyPerformancePath(strategy)}
                  >
                    View backtest performance
                  </Link>
                </div>
              </PerformanceDisclosureGate>

              <div className="grid gap-2">
                <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
                <Link
                  href={getSubscribePath(strategy)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition duration-180 hover:border-pine hover:bg-pine hover:text-white active:border-pine active:bg-pine active:text-white focus-visible:border-pine focus-visible:bg-pine focus-visible:text-white"
                >
                  Subscription details
                  <ExternalLink size={15} aria-hidden="true" />
                </Link>
              </div>
              <p className="text-center text-xs leading-5 text-ink/54">
                Basket execution remains client-directed through the broker. No POA and no auto-execution.
              </p>
            </div>
          </aside>
        </section>

        <style>{`
          .strategy-tab-input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }
          .strategy-tab-list {
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            border-bottom: 1px solid #ded8cd;
            padding-bottom: 0.75rem;
          }
          .strategy-tab-label {
            white-space: nowrap;
            border-radius: 9999px;
            padding: 0.65rem 1rem;
            color: rgba(24, 33, 31, 0.68);
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
          }
          .strategy-tab-label:hover {
            background: #f7f4ef;
          }
          .strategy-tab-panel {
            display: none;
            padding-top: 1.25rem;
          }
          #tab-overview:checked ~ .strategy-tab-list label[for="tab-overview"],
          #tab-methodology:checked ~ .strategy-tab-list label[for="tab-methodology"],
          #tab-holdings:checked ~ .strategy-tab-list label[for="tab-holdings"],
          #tab-rebalances:checked ~ .strategy-tab-list label[for="tab-rebalances"],
          #tab-disclosures:checked ~ .strategy-tab-list label[for="tab-disclosures"] {
            background: #1f3a33;
            color: white;
          }
          #tab-overview:checked ~ .strategy-tab-overview,
          #tab-methodology:checked ~ .strategy-tab-methodology,
          #tab-holdings:checked ~ .strategy-tab-holdings,
          #tab-rebalances:checked ~ .strategy-tab-rebalances,
          #tab-disclosures:checked ~ .strategy-tab-disclosures {
            display: block;
          }
        `}</style>
      </div>
    </main>
  );
}
