import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { GrowthMotif } from "@/components/growth-motif";
import { Reveal } from "@/components/reveal";
import { strategies } from "@/lib/data";
import { raProfile } from "@/lib/compliance";

const processSteps = [
  {
    step: "01",
    title: "Browse public research",
    text: "Explore strategy pages with backtest metrics, methodology, and benchmark comparisons — no account needed."
  },
  {
    step: "02",
    title: "Acknowledge the risk notice",
    text: "Request to view historical backtest performance after reading the standard risk disclosures."
  },
  {
    step: "03",
    title: "Subscribe for access",
    text: "Choose a strategy and subscribe to unlock its latest model portfolio."
  },
  {
    step: "04",
    title: "Follow rebalances",
    text: "Track published rebalance updates and research notes as the model portfolio evolves."
  }
];

export default function HomePage() {
  const featured = strategies[0];
  const preview = strategies.slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden bg-pine text-white">
        <GrowthMotif className="pointer-events-none absolute -right-10 -top-16 hidden h-[420px] w-[420px] sm:block lg:h-[520px] lg:w-[520px]" />
        <div className="container-page relative grid min-h-[calc(100vh-4rem)] content-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Research-backed quant model portfolio subscriptions for Indian equities
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">
              Differentiated quant based model portfolio strategies.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/strategies" className="btn bg-white text-pine hover:bg-white/90">
                View strategies <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="text-sm font-semibold text-white/80 underline-offset-4 transition duration-180 hover:text-white hover:underline"
              >
                Contact research desk
              </Link>
            </div>
          </div>
          <div className="relative self-end rounded border border-white/16 bg-white/8 p-6 transition duration-180 hover:border-white/30 hover:bg-white/12">
            <Link
              className="absolute inset-0 z-0 rounded"
              href={`/strategies/${featured.slug}`}
              aria-label={`View details for ${featured.name}`}
            />
            <p className="relative z-10 text-sm text-white/64">Featured strategy</p>
            <h2 className="relative z-10 mt-3 text-2xl font-semibold">{featured.name}</h2>
            <div className="relative z-10 mt-6 rounded border border-white/16 bg-white/10 p-5 text-sm">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <p className="font-semibold">Backtest performance details locked</p>
                  <p className="mt-2 leading-6 text-white/72">
                    Historical backtest returns are shown only after an explicit risk
                    acknowledgement on the strategy page.
                  </p>
                  <Link
                    href={`/strategies/${featured.slug}`}
                    className="relative z-20 mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 transition duration-180 hover:underline"
                  >
                    View strategy <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="container-page flex flex-col items-center gap-3 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <ShieldCheck size={16} className="text-pine" aria-hidden="true" />
            SEBI-registered Research Analyst &middot; Reg. no. {raProfile.sebiRegistrationNumber}
          </p>
          <Link href="/compliance" className="link-underline text-sm font-semibold hover:underline">
            View compliance &amp; disclosures &rarr;
          </Link>
        </div>
      </section>

      <section className="container-page section-tight">
        <p className="text-sm uppercase tracking-[0.18em] text-clay">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold">From research to rebalance</h2>
        <Reveal className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((item) => (
            <div key={item.step}>
              <p className="font-serif text-3xl text-pine/60">{item.step}</p>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="container-page section-tight">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-clay">Strategy catalogue</p>
            <h2 className="mt-2 text-3xl font-semibold">Research-led model portfolios</h2>
          </div>
          <Link
            href="/strategies"
            className="link-underline inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          >
            View all strategies <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
          {preview.map((strategy) => (
            <Link href={`/strategies/${strategy.slug}`} className="card-interactive p-6" key={strategy.slug}>
              <h3 className="text-lg font-semibold">{strategy.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{strategy.subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {strategy.labels.slice(0, 2).map((label) => (
                  <span className="rounded bg-sky px-2.5 py-0.5 text-xs font-medium text-ink" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </Reveal>
      </section>

    </main>
  );
}
