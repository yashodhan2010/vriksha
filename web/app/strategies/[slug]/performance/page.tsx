import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MonthlyPerformanceChart, YearlyReturnChart } from "@/components/performance-chart";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";
import { PeriodPerformanceView } from "@/components/period-performance-view";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategy } from "@/lib/data";
import { standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";

export default async function StrategyPerformancePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6 sm:pb-10 lg:px-8">
      <Link
        href={`/strategies/${strategy.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/72 hover:text-ink"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to strategy details
      </Link>
      <p className="mt-6 text-sm uppercase tracking-[0.18em] text-clay">Backtests</p>
      <h1 className="mt-2 text-3xl font-semibold">{strategy.name} Backtest Performance</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
        <Link
          href={`/subscribe/${strategy.slug}`}
          className="inline-flex items-center justify-center rounded border border-line px-4 py-3 text-sm font-semibold hover:bg-paper"
        >
          Subscription details
        </Link>
      </div>

      <PerformanceDisclosureGate
        acknowledgementKey={`strategy:${strategy.slug}`}
        className="mt-8"
      >
        <section className="mt-2">
          <PeriodPerformanceView strategy={strategy} />
        </section>
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Monthly Backtest Return Path</h2>
            <div className="mt-4"><MonthlyPerformanceChart data={strategy.monthlyReturns} /></div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Calendar Year Backtest Returns</h2>
            <div className="mt-4"><YearlyReturnChart data={strategy.yearlyReturns} /></div>
          </div>
        </section>
      </PerformanceDisclosureGate>

      <section className="mt-6 card p-5 text-sm leading-6 text-ink/70">
        <p className="font-semibold text-ink">{standardMarketRiskWarning}</p>
        <p className="mt-2">{standardSebiDisclaimer}</p>
        <p className="mt-2">
          Backtested returns are illustrative and do not indicate guaranteed future performance.
          Model portfolios are research products and are not trade execution services.
        </p>
      </section>

      <RegistrationDisclosureBlock
        className="mt-6"
        suitability={strategy.suitability}
        targetInvestor={strategy.targetInvestor}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 px-4 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-line/80 bg-paper/92 p-2 shadow-[0_8px_24px_rgba(24,33,31,0.12)] backdrop-blur">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
            </div>
            <Link
              href={`/subscribe/${strategy.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition duration-180 hover:bg-paper"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
