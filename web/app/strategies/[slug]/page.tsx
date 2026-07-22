import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Download, IndianRupee, ListChecks } from "lucide-react";
import { MetricGrid } from "@/components/metric-grid";
import { MonthlyPerformanceChart, YearlyReturnChart } from "@/components/performance-chart";
import { Paywall } from "@/components/paywall";
import { getStrategy } from "@/lib/data";
import { hasStrategyAccess } from "@/lib/access";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";

export default async function StrategyDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();
  const canViewPortfolio = hasStrategyAccess(strategy.slug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap gap-2">
            {strategy.labels.map((label) => (
              <span className="rounded bg-sky px-3 py-1 text-xs font-medium" key={label}>
                {label}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold">{strategy.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">{strategy.subtitle}</p>
        </div>
        <aside className="rounded border border-line bg-[#fffaf4] p-5">
          <div className="space-y-4 text-sm">
            <p className="flex items-center justify-between gap-3"><span>Benchmark</span><strong>{strategy.benchmark}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Universe</span><strong>{strategy.universe}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Holdings</span><strong>{strategy.targetHoldings}</strong></p>
            <p className="flex items-center justify-between gap-3"><span>Rebalance</span><strong>{strategy.rebalanceFrequency}</strong></p>
          </div>
          <Link href={`/subscribe/${strategy.slug}`} className="mt-5 block rounded bg-pine px-4 py-3 text-center text-sm font-semibold text-white">
            Subscribe
          </Link>
        </aside>
      </section>

      <section className="mt-10">
        <MetricGrid metrics={strategy.metrics} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Monthly Return Path</h2>
          <div className="mt-4"><MonthlyPerformanceChart data={strategy.monthlyReturns} /></div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Calendar Year Returns</h2>
          <div className="mt-4"><YearlyReturnChart data={strategy.yearlyReturns} /></div>
        </div>
      </section>

      <section className="mt-6 rounded border border-line bg-[#fffaf4] p-5 text-sm leading-6 text-ink/70">
        <p className="font-semibold text-ink">{standardMarketRiskWarning}</p>
        <p className="mt-2">{standardSebiDisclaimer}</p>
        <p className="mt-2">
          Backtested returns are illustrative and do not indicate guaranteed future performance.
          Model portfolios are research products and are not trade execution services.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded border border-line bg-[#fffaf4] p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><ListChecks size={18} /> Methodology</h2>
          {strategy.methodologySections && strategy.methodologySections.length > 0 ? (
            <div className="mt-4 space-y-4 text-sm leading-6 text-ink/70">
              {strategy.methodologySections.map((section) => (
                <section key={section.title}>
                  <h3 className="font-semibold text-ink">{section.title}</h3>
                  <p className="mt-1">{section.body}</p>
                </section>
              ))}
            </div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
              {strategy.methodology.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
        <div className="rounded border border-line bg-[#fffaf4] p-6">
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
        </div>
      </section>

      <section className="mt-10">
        {canViewPortfolio ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded border border-line bg-[#fffaf4] p-6">
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
                  <thead className="text-ink/54">
                    <tr><th className="py-2">Symbol</th><th>Company</th><th>Sector</th><th>Weight</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {strategy.holdings.map((holding) => (
                      <tr className="border-t border-line" key={holding.symbol}>
                        <td className="py-3 font-semibold">{holding.symbol}</td>
                        <td>{holding.company}</td>
                        <td>{holding.sector}</td>
                        <td>{(holding.weight * 100).toFixed(1)}%</td>
                        <td>{holding.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded border border-line bg-[#fffaf4] p-6">
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
                  <article className="rounded bg-white p-4" key={rebalance.date}>
                    <p className="text-sm font-semibold">{rebalance.date}</p>
                    <p className="mt-1 text-sm text-ink/68">{rebalance.summary}</p>
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
