import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BacktestReturnMatrix } from "@/components/performance-chart";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";
import { PeriodPerformanceView } from "@/components/period-performance-view";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategy, getStrategyPath, getSubscribePath } from "@/lib/data";
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
    <main className="mx-auto max-w-7xl px-3 pb-36 pt-7 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link
          href="/strategies"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink/72 transition duration-180 hover:border-pine/40 hover:text-pine sm:justify-start sm:px-3 sm:text-sm"
          aria-label="Back to all strategies"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          All strategies
        </Link>
        <Link
          href={getStrategyPath(strategy)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink/72 transition duration-180 hover:border-pine/40 hover:text-pine sm:justify-start sm:px-3 sm:text-sm"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Strategy details
        </Link>
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.18em] text-clay sm:mt-6 sm:text-sm">Backtests</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{strategy.name} Backtest Performance</h1>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
        <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
        <Link
          href={getSubscribePath(strategy)}
          className="inline-flex min-h-11 items-center justify-center rounded border border-line bg-white px-3 py-3 text-xs font-semibold text-ink transition duration-180 hover:border-pine hover:bg-pine hover:text-white active:border-pine active:bg-pine active:text-white focus-visible:border-pine focus-visible:bg-pine focus-visible:text-white sm:px-4 sm:text-sm"
        >
          Subscription details
        </Link>
      </div>

      <PerformanceDisclosureGate
        acknowledgementKey={`strategy:${strategy.slug}`}
        className="mt-6 sm:mt-8"
      >
        <section className="mt-2">
          <PeriodPerformanceView strategy={strategy} />
        </section>
        <section className="mt-8">
          <BacktestReturnMatrix
            monthlyData={strategy.monthlyReturns}
            yearlyData={strategy.yearlyReturns}
            benchmark={strategy.benchmark}
          />
        </section>
      </PerformanceDisclosureGate>

      <section className="mt-6 card p-4 text-sm leading-6 text-ink/70 sm:p-5">
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

      <div className="pointer-events-none fixed inset-x-0 bottom-2 z-20 px-3 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-md rounded-xl border border-line/80 bg-paper/94 p-2 shadow-[0_8px_24px_rgba(24,33,31,0.12)] backdrop-blur">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
            </div>
            <Link
              href={getSubscribePath(strategy)}
              className="inline-flex min-h-11 items-center justify-center rounded border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition duration-180 hover:border-pine hover:bg-pine hover:text-white active:border-pine active:bg-pine active:text-white focus-visible:border-pine focus-visible:bg-pine focus-visible:text-white"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
