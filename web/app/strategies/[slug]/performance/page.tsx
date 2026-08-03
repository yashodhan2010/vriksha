import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MonthlyPerformanceChart, YearlyReturnChart } from "@/components/performance-chart";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";
import { PeriodPerformanceView } from "@/components/period-performance-view";
import { RegistrationDisclosureBlock } from "@/components/registration-disclosure-block";
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/strategies/${strategy.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/72 hover:text-ink"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to strategy details
      </Link>
      <p className="mt-6 text-sm uppercase tracking-[0.18em] text-clay">Backtests</p>
      <h1 className="mt-2 text-3xl font-semibold">{strategy.name} Backtest Performance</h1>

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
    </main>
  );
}
