import Link from "next/link";
import { ArrowRight, Compass, Landmark, Leaf, Shield, TrendingUp, type LucideIcon } from "lucide-react";
import { getPortfolioNeedHref, portfolioNeeds, type PortfolioNeed, type PortfolioNeedId } from "@/lib/portfolio-needs";

const toneClasses: Record<PortfolioNeed["tone"], { card: string; icon: string; chip: string }> = {
  paper: {
    card: "bg-white",
    icon: "bg-paper text-pine",
    chip: "bg-paper text-ink/64"
  },
  moss: {
    card: "bg-[#f3f8f3]",
    icon: "bg-pine text-white",
    chip: "bg-white/80 text-pine"
  },
  gold: {
    card: "bg-[#fff8ea]",
    icon: "bg-gold/22 text-ink",
    chip: "bg-white/80 text-ink/64"
  },
  sky: {
    card: "bg-sky/45",
    icon: "bg-white text-pine",
    chip: "bg-white/80 text-ink/64"
  }
};

const icons: Record<PortfolioNeedId, LucideIcon> = {
  core: Landmark,
  growth: TrendingUp,
  stability: Shield,
  income: Leaf
};

export function PortfolioNeedSelector() {
  return (
    <section className="container-page section-tight">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-clay">Portfolio fit</p>
          <h2 className="mt-2 text-3xl font-semibold">What does your portfolio need?</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink/68">
            Start with the role you want a strategy to play. We will take you to the matching family in the strategy catalog.
          </p>
        </div>
        <div className="rounded border border-line bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-pine text-white">
              <Compass size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">A filter, not a quiz.</p>
              <p className="mt-1 text-sm leading-6 text-ink/62">
                This only narrows the catalog by research family. Suitability, risks, costs, and your own execution remain on each strategy page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {portfolioNeeds.map((need) => {
          const Icon = icons[need.id];
          const tone = toneClasses[need.tone];
          return (
            <Link
              className={`group flex min-h-[260px] flex-col justify-between rounded border border-line p-5 transition duration-250 hover:-translate-y-0.5 hover:border-pine/30 hover:shadow-sm ${tone.card}`}
              href={getPortfolioNeedHref(need.id)}
              key={need.id}
            >
              <div>
                <div className={`grid h-11 w-11 place-items-center rounded ${tone.icon}`}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold">{need.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/66">{need.prompt}</p>
                <p className="mt-3 text-sm leading-6 text-ink/54">{need.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}>{need.matchLabel}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-pine transition group-hover:bg-pine group-hover:text-white">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function PortfolioNeedFilterBar({ activeNeed }: { activeNeed?: string }) {
  return (
    <section className="mt-8 rounded border border-line bg-white/78 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="px-1 lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/46">Portfolio need</p>
          <p className="mt-1 text-sm text-ink/62">Filter by intended role.</p>
        </div>
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          <Link
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${!activeNeed ? "bg-pine text-white" : "bg-paper text-ink/70 hover:bg-white"}`}
            href="/strategies"
          >
            All needs
          </Link>
          {portfolioNeeds.map((need) => (
            <Link
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${activeNeed === need.id ? "bg-pine text-white" : "bg-paper text-ink/70 hover:bg-white"}`}
              href={getPortfolioNeedHref(need.id)}
              key={need.id}
            >
              {need.shortTitle}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
