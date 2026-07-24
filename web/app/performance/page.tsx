import { strategies } from "@/lib/data";
import { YearlyReturnChart } from "@/components/performance-chart";
import { PerformanceDisclosureGate } from "@/components/performance-disclosure-gate";

export default function PerformancePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Backtests</p>
      <h1 className="mt-2 text-3xl font-semibold">Performance And Returns</h1>
      <div className="mt-8">
        <PerformanceDisclosureGate acknowledgementKey="performance-overview" compact>
          <div className="grid gap-8">
            {strategies.map((strategy) => (
              <section className="card-accent-gold p-6" key={strategy.slug}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{strategy.name}</h2>
                    <p className="text-sm text-ink/62">Benchmark: {strategy.benchmark}</p>
                  </div>
                  <p className="text-sm font-semibold">{strategy.price}</p>
                </div>
                <div className="mt-5">
                <YearlyReturnChart data={strategy.yearlyReturns} />
                </div>
              </section>
            ))}
          </div>
        </PerformanceDisclosureGate>
      </div>
    </main>
  );
}
