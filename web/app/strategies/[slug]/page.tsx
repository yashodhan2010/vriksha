import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock3,
  Download,
  ExternalLink,
  Info,
  LockKeyhole,
} from "lucide-react";
import { Paywall } from "@/components/paywall";
import { BacktestReturnMatrix } from "@/components/performance-chart";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";
import { PeriodPerformanceView } from "@/components/period-performance-view";
import { PortfolioAllocationPlanner } from "@/components/portfolio-allocation-planner";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
import { StrategyBacktestLink } from "@/components/strategy-backtest-link";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { StrategySectionNav } from "@/components/strategy-section-nav";
import { hasStrategyAccess } from "@/lib/access";
import { getStrategy, getSubscribePath } from "@/lib/data";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "@/lib/strategy-taxonomy";
import type { PortfolioHolding, Rebalance, Strategy } from "@/lib/types";

function getMinimumCapitalLabel(value: string) {
  const match = value.match(/(?:INR|Rs\.?|₹)?\s*([0-9,]+)(?:\s*lakh|\s*L)?/i);
  if (!match) return value || "Not specified";

  if (/lakh|L/i.test(value) && match[1] === "1") return "₹1,00,000";
  return `₹${match[1]}`;
}

function getRiskLevel(strategy: Strategy) {
  const source = `${strategy.name} ${strategy.labels.join(" ")}`;
  if (/mahogany|asset allocation|multi asset|fixed allocation/i.test(source)) return "Moderate";
  if (/conservative|trunk/i.test(source)) return "Moderate-high";
  return "High";
}

function getInvestmentHorizon(strategy: Strategy) {
  const source = `${strategy.name} ${strategy.labels.join(" ")}`;
  if (/asset allocation|mahogany|multi asset/i.test(source)) return "3Y+";
  return "3Y+";
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
      {children && <div className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">{children}</div>}
    </div>
  );
}

function SplitRisk({ risk }: { risk: string }) {
  const [title, body] = risk.includes(":") ? risk.split(/:\s(.+)/) : ["Risk", risk];
  return (
    <article className="rounded border border-line bg-white p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/62">{body}</p>
    </article>
  );
}

function TopHoldingsGlimpse({ holdings }: { holdings: PortfolioHolding[] }) {
  const topHoldings = [...holdings].sort((a, b) => b.weight - a.weight).slice(0, 5);

  return (
    <div className="rounded border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">Model portfolio glimpse</p>
          <h3 className="mt-1 text-lg font-semibold">Top 5 holdings</h3>
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
            <span className="inline-flex max-w-full rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink/64">
              <span className="truncate">{holding.sector}</span>
            </span>
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
    <div className="rounded border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Recent rebalances</h3>
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
          <article className="rounded border border-line bg-[#fffaf4] p-4" key={rebalance.date}>
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
  const priceLabel = formatMoney(monthlyPrice.amountPaise);
  const minimumCapital = getMinimumCapitalLabel(strategy.minCapital);
  const methodologySummary = strategy.methodologySections?.[0]?.body ?? strategy.methodology[0] ?? strategy.subtitle;
  const allRisks = strategy.keyRisks ?? [];
  const primaryRisks = allRisks.slice(0, 3);
  const detailSections = strategy.methodologySections && strategy.methodologySections.length > 0
    ? strategy.methodologySections
    : strategy.methodology.map((body, index) => ({ title: `Methodology note ${index + 1}`, body }));
  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "backtest", label: "Backtest", locked: true },
    { id: "methodology", label: "Methodology" },
    { id: "portfolio", label: "Portfolio" },
    { id: "risks", label: "Risks" },
    { id: "pricing", label: "Pricing" }
  ];

  return (
    <main className="bg-paper pb-28 md:pb-0">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/strategies"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 hover:border-pine/40 hover:text-pine"
          aria-label="Back to all strategies"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All strategies
        </Link>
      </div>

      <StrategySectionNav items={navItems} />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section id="overview" className="scroll-mt-32 overflow-hidden rounded border border-line bg-[#fffaf4]">
            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-pine/20 bg-pine/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-pine">
                  {family.label} / {edition.label}
                </span>
                <span className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/58">
                  Benchmark: {strategy.benchmark}
                </span>
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
                <div>
                  <div className="flex max-w-3xl items-start gap-3">
                    <h1 className="text-4xl font-semibold text-pine sm:text-5xl">{strategy.name}</h1>
                    <span className="group relative mt-1 inline-flex shrink-0">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-pine transition duration-180 hover:border-pine/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                        type="button"
                        aria-label="What this strategy does and does not do"
                      >
                        <Info size={17} aria-hidden="true" />
                      </button>
                      <span className="pointer-events-none absolute right-0 top-11 z-30 w-[min(22rem,calc(100vw-2rem))] rounded border border-line bg-white p-4 text-sm leading-6 text-ink/72 opacity-0 shadow-soft transition duration-180 group-hover:opacity-100 group-focus-within:opacity-100">
                        <strong className="block text-ink">What it does</strong>
                        {methodologySummary}
                        <strong className="mt-3 block text-ink">What it does not do</strong>
                        It does not provide stock tips, guarantee returns, execute trades, manage client funds, or provide personalised suitability advice.
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">{strategy.subtitle}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/62">
                    {methodologySummary}
                  </p>
                </div>
                <div className="rounded border border-line bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">Quick fit</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <DetailCard label="Risk" value={getRiskLevel(strategy)} />
                    <DetailCard label="Rebalance" value={strategy.rebalanceFrequency} />
                    <DetailCard label="Capital" value={minimumCapital} />
                    <DetailCard label="Holdings" value={`${strategy.targetHoldings}`} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <StrategyBacktestLink
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-pine px-4 py-3 text-sm font-semibold text-white hover:bg-ink"
                  href="#backtest"
                  strategySlug={strategy.slug}
                  strategyFamily={family.label}
                >
                  <BarChart3 size={16} aria-hidden="true" />
                  Review historical performance
                </StrategyBacktestLink>
                <Link
                  href="#methodology"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-pine/40 hover:bg-paper"
                >
                  Understand the methodology
                </Link>
              </div>
            </div>
          </section>

          <section className="grid scroll-mt-32 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Quick decision facts">
            <DetailCard label="Best suited for" value={family.signal} />
            <DetailCard label="Risk level" value={getRiskLevel(strategy)} />
            <DetailCard label="Suggested horizon" value={getInvestmentHorizon(strategy)} />
            <DetailCard label="Rebalance frequency" value={strategy.rebalanceFrequency} />
            <DetailCard label="Target holdings" value={`${strategy.targetHoldings}`} />
            <DetailCard label="Minimum capital" value={minimumCapital} />
          </section>

          <section id="backtest" className="scroll-mt-32 rounded border border-pine/20 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-pine text-white">
                <LockKeyhole size={18} aria-hidden="true" />
              </span>
              <SectionHeader eyebrow="Backtest" title="How has this strategy behaved historically?">
                <p>
                  Review simulated portfolio growth, benchmark comparison, drawdowns and risk-adjusted performance.
                  Historical results are hypothetical and subject to the assumptions and limitations described below.
                </p>
              </SectionHeader>
            </div>
            <PerformanceDisclosureGate
              acknowledgementKey={`strategy:${strategy.slug}`}
              analyticsStrategySlug={strategy.slug}
              analyticsStrategyFamily={family.label}
              className="mt-5"
              unlockFocusId="backtest"
            >
              <div className="mt-2">
                <PeriodPerformanceView strategy={strategy} />
              </div>
              <section className="mt-8">
                <BacktestReturnMatrix
                  monthlyData={strategy.monthlyReturns}
                  yearlyData={strategy.yearlyReturns}
                  benchmark={strategy.benchmark}
                />
              </section>
            </PerformanceDisclosureGate>
          </section>

          <section id="methodology" className="scroll-mt-32 rounded border border-line bg-white p-5 sm:p-6">
            <SectionHeader eyebrow="Methodology" title="Process summary">
              <p>{methodologySummary}</p>
            </SectionHeader>
            <div className="mt-5 grid gap-3">
              {detailSections.map((section) => (
                <details className="group rounded border border-line bg-[#fffaf4] p-4" key={section.title}>
                  <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {section.title}
                      <span className="text-pine transition duration-180 group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-ink/68">{section.body}</p>
                </details>
              ))}
            </div>
          </section>

          <section id="portfolio" className="scroll-mt-32 rounded border border-line bg-[#fffaf4] p-5 sm:p-6">
            <SectionHeader eyebrow="Portfolio" title="Holdings and rebalance information">
              <p>
                Preview the model portfolio structure and review subscriber-only implementation material in one place.
              </p>
            </SectionHeader>
            <div className="mt-5 grid gap-5">
              <TopHoldingsGlimpse holdings={strategy.holdings} />
              {canViewPortfolio ? (
                <>
                  <PortfolioAllocationPlanner
                    csvHref={strategy.exports?.latestModelPortfolioCsv}
                    holdings={strategy.holdings}
                    strategyName={strategy.name}
                    strategySlug={strategy.slug}
                  />
                  <RecentRebalances strategy={strategy} />
                </>
              ) : (
                <Paywall slug={strategy.slug} />
              )}
            </div>
          </section>

          <section id="risks" className="scroll-mt-32 rounded border border-line bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-1 text-clay" aria-hidden="true" />
              <SectionHeader eyebrow="Risks" title="Primary risks to understand">
                <p>These risks are not exhaustive. Read the complete risk list before subscribing.</p>
              </SectionHeader>
            </div>
            {primaryRisks.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {primaryRisks.map((risk) => (
                  <SplitRisk risk={risk} key={risk} />
                ))}
              </div>
            )}
            {allRisks.length > primaryRisks.length && (
              <details className="mt-4 rounded border border-line bg-[#fffaf4] p-4">
                <summary className="cursor-pointer font-semibold text-pine">View all risks</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {allRisks.slice(3).map((risk) => (
                    <SplitRisk risk={risk} key={risk} />
                  ))}
                </div>
              </details>
            )}
          </section>

          <section id="pricing" className="scroll-mt-32 rounded border border-line bg-[#fffaf4] p-5 sm:p-6">
            <SectionHeader eyebrow="Pricing" title="Subscription and implementation summary" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <DetailCard label="Monthly price" value={`${priceLabel}/month`} />
              <DetailCard label="Minimum capital" value={minimumCapital} />
              <DetailCard label="Recommended capital" value="₹5,00,000" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
              <Link
                href={getSubscribePath(strategy)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition duration-180 hover:border-pine hover:bg-pine hover:text-white"
              >
                Subscription details
                <ExternalLink size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-ink/54">
              Basket execution remains client-directed through the broker. No POA and no auto-execution.
            </p>
          </section>

          <section className="scroll-mt-32 rounded border border-line bg-white p-5 text-sm leading-6 text-ink/70 sm:p-6">
            <SectionHeader eyebrow="Disclosures" title="Detailed disclosures" />
            <div className="mt-5 rounded border border-pine/20 bg-pine/[0.04] p-4">
              <p className="font-semibold text-ink">{standardMarketRiskWarning}</p>
              <p className="mt-2">{standardSebiDisclaimer}</p>
              <p className="mt-2">
                Backtested returns are illustrative and do not indicate guaranteed future performance.
                Model portfolios are research products and are not trade execution services.
              </p>
            </div>
            <RegistrationDisclosureBlock
              className="mt-5"
              suitability={strategy.suitability}
              targetInvestor={strategy.targetInvestor}
            />
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded border border-line bg-white p-5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">Strategy summary</p>
            <h2 className="mt-2 text-xl font-semibold">{strategy.name}</h2>
            <div className="mt-4 grid gap-3">
              <DetailCard label="Price" value={`${priceLabel}/month`} />
              <DetailCard label="Minimum capital" value={minimumCapital} />
              <DetailCard label="Recommended capital" value="₹5,00,000" />
            </div>
            <StrategyBacktestLink
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-pine px-4 py-3 text-sm font-semibold text-white hover:bg-ink"
              href="#backtest"
              strategySlug={strategy.slug}
              strategyFamily={family.label}
            >
              <BarChart3 size={16} aria-hidden="true" />
              Review backtest
            </StrategyBacktestLink>
            <div className="mt-3">
              <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
            </div>
          </div>
        </aside>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-2 gap-2 rounded-xl border border-line/80 bg-paper/95 p-2 shadow-[0_8px_24px_rgba(24,33,31,0.12)] backdrop-blur">
          <StrategyBacktestLink
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-pine px-3 py-2 text-xs font-semibold text-white"
            href="#backtest"
            strategySlug={strategy.slug}
            strategyFamily={family.label}
          >
            <BarChart3 size={15} aria-hidden="true" />
            View backtest
          </StrategyBacktestLink>
          <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
        </div>
      </div>
    </main>
  );
}
