import Link from "next/link";
import { ArrowRight, FileCheck2, LockKeyhole, RefreshCw } from "lucide-react";
import { strategies } from "@/lib/data";

export default function HomePage() {
  const featured = strategies[0];

  return (
    <main>
      <section className="bg-pine text-white">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-white/68">SEBI RA model portfolios</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Vriksha strategy subscriptions
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">
              Browse public strategy research, compare backtested performance, and subscribe for
              access to the latest model portfolio and recent rebalances.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/strategies" className="inline-flex items-center gap-2 rounded bg-white px-5 py-3 text-sm font-semibold text-pine">
                View strategies <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="rounded border border-white/24 px-5 py-3 text-sm font-semibold text-white">
                Contact research desk
              </Link>
            </div>
          </div>
          <div className="self-end rounded border border-white/16 bg-white/8 p-6">
            <p className="text-sm text-white/64">Featured strategy</p>
            <h2 className="mt-3 text-2xl font-semibold">{featured.name}</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {featured.metrics.slice(0, 4).map((metric) => (
                <div className="rounded bg-white/10 p-4" key={metric.label}>
                  <p className="text-white/58">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { icon: FileCheck2, title: "Public research pages", text: "Backtest metrics, methodology, benchmark comparison, risk notes, and disclosures." },
          { icon: LockKeyhole, title: "Subscriber paywall", text: "Latest model portfolio and last five rebalances are gated by active strategy access." },
          { icon: RefreshCw, title: "Live rebalance runner", text: "Finalized strategy logic can run inside Vriksha after approval and versioning." }
        ].map((item) => (
          <div className="rounded border border-line bg-[#fffaf4] p-6" key={item.title}>
            <item.icon size={20} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
