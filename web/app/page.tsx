import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { GrowthMotif } from "@/components/growth-motif";
import { HowItWorksRoadmap } from "@/components/how-it-works-roadmap";
import { LandingHeroSignal } from "@/components/landing-hero-signal";
import { PortfolioNeedSelector } from "@/components/portfolio-need-selector";
import { getStrategyPath, strategies } from "@/lib/data";
import { raProfile } from "@/lib/compliance";

export default function HomePage() {
  const featured = strategies[0];
  const featuredName = featured.public_name ?? featured.name;
  const featuredLabels = featured.labels
    .filter((label) => !/model portfolio/i.test(label))
    .slice(0, 3);

  return (
    <main>
      <section className="landing-hero relative overflow-hidden bg-pine text-white">
        <GrowthMotif className="pointer-events-none absolute -right-12 -top-20 hidden h-[440px] w-[440px] text-white opacity-[0.11] sm:block lg:h-[620px] lg:w-[620px]" />
        <div className="container-page relative grid min-h-[calc(100vh-4rem)] content-center gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.04fr)_minmax(390px,0.86fr)] lg:gap-12">
          <div className="hero-copy max-w-3xl">
            <p className="hero-kicker text-xs font-semibold uppercase tracking-[0.2em] text-white/62">
              Research-led model portfolios
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-[4.6rem]">
              Invest with a system.
              <span className="block">Not a hunch.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/76 sm:text-lg">
              Research-backed model portfolios built around clear rules, defined risks and disciplined rebalancing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/strategies" className="group btn bg-white text-pine hover:bg-[#fffaf4]">
                Explore strategies
                <ArrowRight className="transition-transform duration-180 group-hover:translate-x-1" size={16} aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 transition duration-180 hover:text-white hover:underline"
              >
                How it works
                <ArrowDown className="transition-transform duration-180 group-hover:translate-y-0.5" size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-7 text-sm font-medium text-white/58">
              Indian equities &bull; Multi-asset strategies &bull; Transparent methodology
            </p>
          </div>

          <aside className="hero-card relative self-center rounded border border-white/14 bg-white/[0.07] p-4 shadow-lift backdrop-blur-sm sm:p-5">
            <div className="rounded border border-white/12 bg-pine/28 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/58">Featured strategy</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{featuredName}</h2>
                  {featuredLabels.length > 0 && (
                    <p className="mt-2 text-sm text-white/66">
                      {featuredLabels.map((label, index) => (
                        <span key={label}>
                          {index > 0 && <span aria-hidden="true"> &bull; </span>}
                          {label}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-white/14 px-3 py-1 text-xs font-semibold text-white/70">
                  {featured.status}
                </span>
              </div>

              <div className="mt-5">
                <LandingHeroSignal strategy={featured} />
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={getStrategyPath(featured)}
                  className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Explore methodology
                  <ArrowRight className="transition-transform duration-180 group-hover:translate-x-1" size={15} aria-hidden="true" />
                </Link>
                <div className="flex max-w-xs items-start gap-2 text-xs leading-5 text-white/56">
                  <LockKeyhole className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
                  <p>Detailed backtest metrics are available after risk acknowledgement.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="relative border-t border-white/10 bg-[#f7f4ef] text-pine">
          <a
            href="#how-it-works"
            className="container-page flex items-center justify-between gap-4 py-4 text-sm font-semibold"
          >
            <span>Three strategy families. One disciplined investment process.</span>
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>

        <style>{`
          .landing-hero .hero-kicker,
          .landing-hero .hero-copy h1,
          .landing-hero .hero-copy p,
          .landing-hero .hero-copy a,
          .landing-hero .hero-card {
            animation: hero-enter 760ms ease-out both;
          }

          .landing-hero .hero-copy h1 { animation-delay: 110ms; }
          .landing-hero .hero-copy p { animation-delay: 220ms; }
          .landing-hero .hero-copy a { animation-delay: 320ms; }
          .landing-hero .hero-card { animation-delay: 360ms; }

          @keyframes hero-enter {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (min-width: 1024px) {
            .landing-hero .hero-card {
              animation-name: hero-card-enter;
            }

            @keyframes hero-card-enter {
              from { opacity: 0; transform: translateX(14px); }
              to { opacity: 1; transform: translateX(0); }
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .landing-hero .hero-kicker,
            .landing-hero .hero-copy h1,
            .landing-hero .hero-copy p,
            .landing-hero .hero-copy a,
            .landing-hero .hero-card {
              animation: none;
            }
          }
        `}</style>
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

      <HowItWorksRoadmap />

      <div id="portfolio-needs">
        <PortfolioNeedSelector />
      </div>
    </main>
  );
}
