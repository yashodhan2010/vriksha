import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategyPath, strategies } from "@/lib/data";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import {
  getEditionMeta,
  getFamilyMeta,
  getStrategyEdition,
  getStrategyFamily,
  strategyFamilies,
  type StrategyFamily
} from "@/lib/strategy-taxonomy";

type StrategyCatalogPageProps = {
  searchParams?: Promise<{
    family?: string;
  }>;
};

function isFamily(value: string | undefined): value is StrategyFamily {
  return strategyFamilies.some((item) => item.id === value);
}

function filterHref(family?: StrategyFamily) {
  const params = new URLSearchParams();
  if (family) params.set("family", family);
  const query = params.toString();
  return query ? `/strategies?${query}` : "/strategies";
}

export default async function StrategyCatalogPage({ searchParams }: StrategyCatalogPageProps) {
  const params = await searchParams;
  const activeFamily = isFamily(params?.family) ? params.family : undefined;

  const filteredStrategies = strategies.filter((strategy) => {
    const family = getStrategyFamily(strategy);
    return !activeFamily || family === activeFamily;
  });

  const groupedFamilies = strategyFamilies
    .map((family) => ({
      ...family,
      strategies: filteredStrategies.filter((strategy) => getStrategyFamily(strategy) === family.id)
    }))
    .filter((family) => family.strategies.length > 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-clay">Strategy Grove</p>
        <h1 className="mt-2 text-3xl font-semibold">Explore Stock Baskets</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">
          Vriksha strategies are organized by growth family and edition, so each basket has a clear place in the research map.
        </p>
      </div>

      <section className="mt-8 rounded border border-line bg-white/78 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            className={`rounded border p-4 transition duration-180 ${!activeFamily ? "border-pine bg-pine text-white" : "border-line bg-paper text-ink hover:border-pine/40 hover:bg-white"}`}
            href={filterHref()}
          >
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] opacity-70">All families</span>
            <span className="mt-1 block text-lg font-semibold">Full Grove</span>
            <span className="mt-2 block text-xs leading-5 opacity-70">Browse every basket across Vriksha research families.</span>
          </Link>
          {strategyFamilies.map((family) => (
            <Link
              className={`rounded border p-4 transition duration-180 ${activeFamily === family.id ? "border-pine bg-pine text-white" : "border-line bg-paper text-ink hover:border-pine/40 hover:bg-white"}`}
              href={filterHref(family.id)}
              key={family.id}
            >
              <span className="block text-lg font-semibold">{family.label}</span>
              <span className="mt-2 block text-xs leading-5 opacity-70">{family.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-10">
        {groupedFamilies.map((family) => (
          <section key={family.id}>
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-clay">{family.signal}</p>
                <h2 className="text-2xl font-semibold">{family.label}</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-ink/64">{family.summary}</p>
            </div>
            <Reveal className="mt-5 grid gap-4 md:grid-cols-2">
              {family.strategies.map((strategy) => {
                const strategyFamily = getFamilyMeta(getStrategyFamily(strategy));
                const edition = getEditionMeta(getStrategyEdition(strategy));
                return (
                  <article className="card-interactive relative cursor-pointer p-6" key={strategy.slug}>
                    <Link
                      className="absolute inset-0 z-10 rounded"
                      href={getStrategyPath(strategy)}
                      aria-label={`View details for ${strategy.name}`}
                    />
                    <div className="pointer-events-none relative z-20 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded bg-pine/10 px-3 py-1 text-pine">{strategyFamily.label}</span>
                          <span className="rounded bg-gold/20 px-3 py-1 text-ink/72">{edition.label}</span>
                        </div>
                        <h3 className="text-xl font-semibold">{strategy.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-ink/68">{strategy.subtitle}</p>
                      </div>
                      <ArrowRight size={18} aria-hidden="true" />
                    </div>
                    <div className="pointer-events-none relative z-20 mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1 text-xs font-medium text-ink/70">
                        <Check size={12} aria-hidden="true" />
                        {strategyFamily.signal}
                      </span>
                      <span className="rounded bg-white px-3 py-1 text-xs font-medium text-ink/70">{edition.summary}</span>
                      {strategy.labels.filter((label) => !/conservative|low\s*drawdown/i.test(label)).slice(0, 2).map((label) => (
                        <span className="rounded bg-sky px-3 py-1 text-xs font-medium text-ink" key={label}>
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="pointer-events-none relative z-20 mt-6 grid grid-cols-[1fr_auto] items-center gap-3 rounded border border-line bg-white p-4 text-sm">
                      <div>
                        <p className="font-semibold">Backtest performance details locked</p>
                        <p className="mt-1 text-ink/58">Open the strategy page to explicitly request historical backtest returns.</p>
                      </div>
                      <LockKeyhole size={18} aria-hidden="true" />
                    </div>
                    <div className="pointer-events-none relative z-20 mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">
                        {formatMoney(getStrategyPrice(strategy.slug, "monthly").amountPaise)} / month
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center justify-center gap-2 rounded border border-line px-4 py-3 text-sm font-semibold">
                          View details
                        </span>
                        <div className="pointer-events-auto relative z-30">
                          <StrategyBasketButton slug={strategy.slug} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </Reveal>
          </section>
        ))}
        {groupedFamilies.length === 0 && (
          <div className="rounded border border-line bg-white p-6 text-sm text-ink/68">
            No strategy baskets match this selection.
          </div>
        )}
      </div>
    </main>
  );
}
