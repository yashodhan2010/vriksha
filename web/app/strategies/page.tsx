import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { strategies } from "@/lib/data";

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
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {strategies.map((strategy) => (
          <Link
            href={`/strategies/${strategy.slug}`}
            className="rounded border border-line bg-[#fffaf4] p-6 shadow-soft transition hover:-translate-y-0.5"
            key={strategy.slug}
          >
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
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-ink/52">CAGR</p>
                <p className="font-semibold">{strategy.metrics[0].value}</p>
              </div>
              <div>
                <p className="text-ink/52">Drawdown</p>
                <p className="font-semibold">{strategy.metrics[1].value}</p>
              </div>
              <div>
                <p className="text-ink/52">Price</p>
                <p className="font-semibold">{strategy.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
