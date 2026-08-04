import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  Download,
  IndianRupee,
  ListChecks,
  LockKeyhole,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { Paywall } from "@/components/paywall";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
import { Reveal } from "@/components/reveal";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategy } from "@/lib/data";
import { hasStrategyAccess } from "@/lib/access";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "@/lib/strategy-taxonomy";
import type { Rebalance } from "@/lib/types";

const actionStyles: Record<Rebalance["changes"][number]["action"], { icon: typeof Plus; className: string }> = {
  Added: { icon: Plus, className: "text-moss" },
  Removed: { icon: Minus, className: "text-clay" },
  Increased: { icon: TrendingUp, className: "text-moss" },
  Reduced: { icon: TrendingDown, className: "text-clay" },
  "Weight changed": { icon: ArrowLeftRight, className: "text-ink/70" },
  Unchanged: { icon: Minus, className: "text-ink/50" }
};

function RebalanceActionBadge({ action }: { action: Rebalance["changes"][number]["action"] }) {
  const { icon: Icon, className } = actionStyles[action];
  return (
    <span className={`flex items-center gap-1.5 font-medium ${className}`}>
      <Icon size={13} aria-hidden="true" />
      {action}
    </span>
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/strategies"
        className="mb-6 inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/72 transition duration-180 hover:border-pine/40 hover:text-pine"
        aria-label="Back to all strategies"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All strategies
      </Link>
      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap gap-2">
            {strategy.labels.filter((label) => !/conservative|low\s*drawdown/i.test(label)).map((label) => (
              <span className="rounded bg-sky px-3 py-1 text-xs font-medium" key={label}>
                {label}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold">{strategy.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">{strategy.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded border border-pine/20 bg-pine/10 px-3 py-2 font-semibold text-pine">
              {family.label} · {family.signal}
            </span>
            <span className="rounded border border-gold/30 bg-gold/20 px-3 py-2 font-semibold text-ink/72">
              {edition.label} · {edition.summary}
            </span>
          </div>
        </div>
        <aside className="card p-5">
          <div className="space-y-4 text-sm">
            <p className="flex items-center justify-between gap-3"><span>Benchmark</span><strong>{strategy.benchmark}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Universe</span><strong>{strategy.universe}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Holdings</span><strong>{strategy.targetHoldings}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Rebalance</span><strong>{strategy.rebalanceFrequency}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Monthly fee</span><strong>{formatMoney(getStrategyPrice(strategy.slug, "monthly").amountPaise)}</strong></p>
          </div>
          <div className="mt-5 grid gap-2">
            <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
            <Link href={`/subscribe/${strategy.slug}`} className="block rounded border border-line px-4 py-3 text-center text-sm font-semibold">
              Subscription details
            </Link>
          </div>
        </aside>
      </section>

      <section className="relative mt-8 overflow-hidden rounded border border-line/80 bg-white/58 p-4 shadow-sm backdrop-blur">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="grid h-full grid-cols-3 gap-3 p-4 blur-[2px]">
            {strategy.metrics.slice(0, 3).map((metric) => (
              <div className="rounded border border-line bg-paper/82 p-4" key={metric.label}>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/46">{metric.label}</p>
                <p className="mt-3 h-7 rounded bg-line/70" />
                <p className="mt-3 h-3 w-2/3 rounded bg-line/60" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex min-h-32 flex-col items-start justify-center gap-3 rounded bg-paper/72 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Locked research view</p>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              A historical return path and period-by-period performance view is available after the disclosure acknowledgement.
            </p>
          </div>
          <Link
            href={`/strategies/${strategy.slug}/performance`}
            className="inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition duration-180 hover:bg-pine"
          >
            <LockKeyhole size={16} aria-hidden="true" />
            VIEW BACKTEST PERFORMANCE
          </Link>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <a
          href="#strategy-content"
          className="group grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink/62 shadow-sm transition duration-180 hover:border-pine/40 hover:text-pine"
          aria-label="Scroll to strategy details"
        >
          <ChevronDown className="transition duration-180 group-hover:translate-y-0.5" size={20} aria-hidden="true" />
        </a>
      </div>

      <section className="mt-8 scroll-mt-24" id="strategy-content">
        <Reveal className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-6">
          <h2 className="flex items-center gap-2.5 text-xl font-semibold">
            <span className="icon-chip"><ListChecks size={16} /></span> Methodology
          </h2>
          {strategy.methodologySections && strategy.methodologySections.length > 0 ? (
            <div className="mt-4 space-y-4 text-[15px] leading-7 text-ink/85">
              {strategy.methodologySections.map((section) => (
                <section key={section.title}>
                  <h3 className="font-semibold text-ink">{section.title}</h3>
                  <p className="mt-1">{section.body}</p>
                </section>
              ))}
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-ink/85">
              {strategy.methodology.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Research Details</h2>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <p className="rounded bg-white p-4"><CalendarDays size={16} /> <span className="mt-2 block text-ink/52">Frequency</span><strong>{strategy.rebalanceFrequency}</strong></p>
            <p className="rounded bg-white p-4"><IndianRupee size={16} /> <span className="mt-2 block text-ink/52">Minimum</span><strong>{strategy.minCapital}</strong></p>
            <p className="rounded bg-white p-4"><ListChecks size={16} /> <span className="mt-2 block text-ink/52">RA</span><strong>{strategy.raName}</strong></p>
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/58">
            SEBI registration: {strategy.sebiRegistration}. Backtests are illustrative and depend on
            assumptions documented in the strategy package.
          </p>
          {strategy.benchmarkComposition && (
            <p className="mt-2 text-xs leading-5 text-ink/58">
              Benchmark composition: {strategy.benchmarkComposition}
            </p>
          )}
        </div>
        </Reveal>
      </section>

      {strategy.keyRisks && strategy.keyRisks.length > 0 && (
        <section className="mt-10 card p-6">
          <h2 className="text-xl font-semibold">Key Risks</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink/72">
            {strategy.keyRisks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </section>
      )}

      <RegistrationDisclosureBlock
        className="mt-10"
        suitability={strategy.suitability}
        targetInvestor={strategy.targetInvestor}
      />

      <section className="mt-10">
        {canViewPortfolio ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card-accent-gold p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Latest Model Portfolio</h2>
                {strategy.exports?.latestModelPortfolioCsv && (
                  <a
                    className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-medium text-white"
                    href={strategy.exports.latestModelPortfolioCsv}
                  >
                    <Download size={15} aria-hidden="true" />
                    CSV
                  </a>
                )}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-ink/52">
                    <tr><th className="py-2 font-medium">Symbol</th><th className="font-medium">Company</th><th className="font-medium">Sector</th><th className="font-medium">Weight</th><th className="font-medium">Note</th></tr>
                  </thead>
                  <tbody>
                    {strategy.holdings.map((holding) => {
                      const maxWeight = Math.max(...strategy.holdings.map((item) => item.weight));
                      return (
                        <tr className="border-t border-line transition-colors duration-180 hover:bg-paper" key={holding.symbol}>
                          <td className="py-3 font-semibold">{holding.symbol}</td>
                          <td>{holding.company}</td>
                          <td>
                            <span className="rounded-full bg-sky/60 px-2.5 py-0.5 text-xs font-medium text-ink/72">{holding.sector}</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums font-medium">{(holding.weight * 100).toFixed(1)}%</span>
                              <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-line">
                                <span
                                  className="block h-full rounded-full bg-pine"
                                  style={{ width: `${(holding.weight / maxWeight) * 100}%` }}
                                />
                              </span>
                            </div>
                          </td>
                          <td className="text-ink/68">{holding.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-accent-gold p-6">
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
                  <article className="rounded border border-line bg-white p-4" key={rebalance.date}>
                    <p className="text-sm font-semibold">{rebalance.date}</p>
                    <p className="mt-1 text-sm text-ink/68">{rebalance.summary}</p>
                    {rebalance.changes.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                        {rebalance.changes.map((change) => (
                          <li className="flex flex-wrap items-center justify-between gap-2 text-xs" key={change.symbol}>
                            <RebalanceActionBadge action={change.action} />
                            <span className="font-medium text-ink">{change.symbol}</span>
                            <span className="tabular-nums text-ink/58">
                              {(change.oldWeight * 100).toFixed(1)}% &rarr; {(change.newWeight * 100).toFixed(1)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Paywall slug={strategy.slug} />
        )}
      </section>
    </main>
  );
}
