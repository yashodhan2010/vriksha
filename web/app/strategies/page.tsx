import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { strategies } from "@/lib/data";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";

export default function StrategyCatalogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-clay">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold">Strategies</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-ink/68">
          Public pages show performance, methodology, risk, and benchmark context. Subscriber-only
          pages reveal the current model portfolio and rebalance trail.
        </p>
      </div>
      <div className="mt-8">
        <Reveal className="grid gap-4 md:grid-cols-2">
        {strategies.map((strategy) => (
          <article className="card-interactive p-6" key={strategy.slug}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{strategy.name}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/68">{strategy.subtitle}</p>
              </div>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {strategy.labels.map((label) => (
                <span className="rounded bg-sky px-3 py-1 text-xs font-medium text-ink" key={label}>
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-3 rounded border border-line bg-white p-4 text-sm">
              <div>
                <p className="font-semibold">Performance details locked</p>
                <p className="mt-1 text-ink/58">Open the strategy page to explicitly request historical returns.</p>
              </div>
              <LockKeyhole size={18} aria-hidden="true" />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {formatMoney(getStrategyPrice(strategy.slug, "monthly").amountPaise)} / month
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/strategies/${strategy.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded border border-line px-4 py-3 text-sm font-semibold"
                >
                  View details
                </Link>
                <StrategyBasketButton slug={strategy.slug} />
              </div>
            </div>
          </article>
        ))}
        </Reveal>
      </div>
    </main>
  );
}
