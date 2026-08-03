import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftRight,
  CalendarDays,
  Download,
  IndianRupee,
  ListChecks,
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
            <Link href={`/strategies/${strategy.slug}/performance`} className="block rounded border border-line px-4 py-3 text-center text-sm font-semibold">
              View backtest performance
            </Link>
            <Link href={`/subscribe/${strategy.slug}`} className="block rounded border border-line px-4 py-3 text-center text-sm font-semibold">
              Subscription details
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-10">
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
