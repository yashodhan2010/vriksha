import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { ContactMailForm } from "@/components/contact-mail-form";
import { GrowthMotif } from "@/components/growth-motif";
import { LandingHeroSignal } from "@/components/landing-hero-signal";
import { getStrategyPath, strategies } from "@/lib/data";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "@/lib/strategy-taxonomy";
import { raProfile } from "@/lib/compliance";

function isHomeStrategy(strategy: { name: string; public_name?: string }) {
  const displayName = strategy.public_name ?? strategy.name;
  return !/^Bamboo\s+Trunk\b/i.test(displayName)
    && !/^Bamboo\s+Root$/i.test(displayName);
}

export default function HomePage() {
  const featured =
    strategies.find((strategy) => strategy.slug === "dual-momentum")
    ?? strategies.find((strategy) => /Bamboo Canopy/i.test(strategy.public_name ?? strategy.name))
    ?? strategies[0];
  const featuredName = featured.public_name ?? featured.name;
  const featuredLabels = featured.labels
    .filter((label) => !/model portfolio/i.test(label))
    .slice(0, 3);
  const homeStrategies = strategies
    .filter(isHomeStrategy)
    .sort((a, b) => {
      if (a.slug === featured.slug) return -1;
      if (b.slug === featured.slug) return 1;
      return 0;
    });
  const secondaryStrategies = homeStrategies.filter((strategy) => strategy.slug !== featured.slug);
  const heroSteps = [
    ["01", "Pick a basket", "Choose a rules-based stock or ETF basket that fits the role you need."],
    ["02", "Complete KYC and subscribe", "Finish verification, accept disclosures, and pay the flat fee."],
    ["03", "Receive the file", "Get weights, notes, and a broker-ready order file on schedule."],
    ["04", "Place and review", "Execute in your own demat and track rebalances from the dashboard."]
  ];

  return (
    <main>
      <section className="landing-hero relative overflow-hidden bg-pine text-white">
        <GrowthMotif className="pointer-events-none absolute -right-12 -top-20 hidden h-[440px] w-[440px] text-white opacity-[0.11] sm:block lg:h-[620px] lg:w-[620px]" />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.04fr)_minmax(390px,0.86fr)] lg:gap-12 lg:py-20">
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
                href="#live-baskets"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 transition duration-180 hover:text-white hover:underline"
              >
                View live baskets
                <ArrowDown className="transition-transform duration-180 group-hover:translate-y-0.5" size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-7 text-sm font-medium text-white/58">
              Indian equities &bull; Multi-asset strategies &bull; Transparent methodology
            </p>
          </div>

          <aside className="hero-card relative self-center rounded border border-white/14 bg-white/[0.07] p-4 shadow-lift backdrop-blur-sm sm:p-5">
            <div className="rounded border border-white/12 bg-pine/28 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/58">How it works</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">From research rule to your demat</h2>
              <p className="mt-3 text-sm leading-6 text-white/66">
                You keep custody. Vriksha publishes the research, weights, and rebalance file.
              </p>
              <div className="hero-flow relative mt-6 overflow-hidden rounded border border-white/10 bg-white/[0.035] px-3 py-4 sm:px-4">
                <svg
                  className="pointer-events-none absolute inset-y-5 left-5 hidden h-[calc(100%-2.5rem)] w-16 sm:block"
                  preserveAspectRatio="none"
                  viewBox="0 0 64 260"
                  aria-hidden="true"
                >
                  <path
                    d="M34 2 C8 38 58 58 30 94 C6 128 58 146 31 184 C12 214 41 232 28 258"
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="2"
                  />
                  <path
                    className="hero-flow-path"
                    d="M34 2 C8 38 58 58 30 94 C6 128 58 146 31 184 C12 214 41 232 28 258"
                    fill="none"
                    stroke="#d6b96a"
                    strokeLinecap="round"
                    strokeWidth="2"
                    pathLength="100"
                  />
                </svg>

                <div className="space-y-4 sm:pl-14">
                  {heroSteps.map(([step, title, text], index) => (
                    <div className="hero-flow-step grid grid-cols-[42px_1fr] gap-3" key={step} style={{ animationDelay: `${160 + index * 120}ms` }}>
                      <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-white/24 bg-pine text-xs font-semibold text-white shadow-[0_0_0_6px_rgba(255,255,255,0.04)]">
                        {step}
                      </span>
                      <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                        <h3 className="text-sm font-semibold text-white">{title}</h3>
                        <p className="mt-1 text-xs leading-5 text-white/58">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="#live-baskets" className="group inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline">
                  See live baskets
                  <ArrowRight className="transition-transform duration-180 group-hover:translate-x-1" size={15} aria-hidden="true" />
                </Link>
                <span className="inline-flex items-start gap-2 text-xs leading-5 text-white/56">
                  <LockKeyhole className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
                  No custody, no trade execution, no percentage fee.
                </span>
              </div>
            </div>
          </aside>
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

          .landing-hero .hero-flow-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: hero-flow-draw 960ms ease-out 520ms forwards;
          }

          .landing-hero .hero-flow-step {
            opacity: 0;
            transform: translateY(8px);
            animation: hero-flow-step 520ms ease-out forwards;
          }

          @keyframes hero-enter {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes hero-flow-draw {
            to { stroke-dashoffset: 0; }
          }

          @keyframes hero-flow-step {
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
            .landing-hero .hero-card,
            .landing-hero .hero-flow-path,
            .landing-hero .hero-flow-step {
              animation: none;
              opacity: 1;
              transform: none;
              stroke-dashoffset: 0;
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

      <section id="live-baskets" className="container-page section-tight">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-clay">Live baskets</p>
            <h2 className="mt-2 text-3xl font-semibold">Choose the rule you want to follow</h2>
          </div>
          <Link href="/strategies" className="w-fit text-sm font-semibold text-pine underline-offset-4 hover:underline">
            Open full catalog
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <article className="group rounded border border-pine/22 bg-[#fffaf4] p-5 text-ink shadow-xs transition duration-250 hover:-translate-y-0.5 hover:border-pine/40 hover:bg-pine hover:text-white hover:shadow-soft sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay transition-colors group-hover:text-white/58">Featured strategy</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink transition-colors group-hover:text-white">{featuredName}</h3>
                {featuredLabels.length > 0 && (
                  <p className="mt-2 text-sm text-ink/62 transition-colors group-hover:text-white/66">
                    {featuredLabels.map((label, index) => (
                      <span key={label}>
                        {index > 0 && <span aria-hidden="true"> &bull; </span>}
                        {label}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-pine/20 px-3 py-1 text-xs font-semibold text-pine transition-colors group-hover:border-white/18 group-hover:text-white/76">
                {featured.status}
              </span>
            </div>

            <div className="mt-5">
              <LandingHeroSignal strategy={featured} />
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={getStrategyPath(featured)}
                className="group/link inline-flex w-fit items-center gap-2 text-sm font-semibold text-pine underline-offset-4 transition-colors hover:underline group-hover:text-white"
              >
                Explore methodology
                <ArrowRight className="transition-transform duration-180 group-hover/link:translate-x-1" size={15} aria-hidden="true" />
              </Link>
              <div className="flex max-w-xs items-start gap-2 text-xs leading-5 text-ink/54 transition-colors group-hover:text-white/56">
                <LockKeyhole className="mt-0.5 shrink-0" size={14} aria-hidden="true" />
                <p>Detailed backtest metrics are available after risk acknowledgement.</p>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {secondaryStrategies.map((strategy) => {
              const strategyName = strategy.public_name ?? strategy.name;
              const family = getFamilyMeta(getStrategyFamily(strategy));
              const edition = getEditionMeta(getStrategyEdition(strategy));
              const price = getStrategyPrice(strategy.slug, "monthly");

              return (
                <Link
                  href={getStrategyPath(strategy)}
                  className="group rounded border border-line bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-pine/35 hover:shadow-sm"
                  key={strategy.slug}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded bg-pine/10 px-3 py-1 text-pine">{family.label}</span>
                        <span className="rounded bg-gold/20 px-3 py-1 text-ink/72">{edition.label}</span>
                      </div>
                      <h3 className="text-xl font-semibold">{strategyName}</h3>
                      <p className="mt-2 text-sm leading-6 text-ink/64">{strategy.subtitle}</p>
                    </div>
                    <ArrowRight className="mt-1 shrink-0 text-pine transition duration-180 group-hover:translate-x-1" size={18} aria-hidden="true" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    {[
                      ["Role", family.signal],
                      ["Holdings", `${strategy.targetHoldings}`],
                      ["Rebalance", strategy.rebalanceFrequency]
                    ].map(([label, value]) => (
                      <div className="rounded border border-line bg-paper px-3 py-2" key={label}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ink/44">{label}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-ink/74">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-sm font-semibold">{formatMoney(price.amountPaise)} / month</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine">
                      Read strategy <Check size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f0e8] py-12 sm:py-16">
        <div className="container-page">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">The analyst</p>
            <h2 className="mt-3 text-3xl font-semibold">A note from the analyst.</h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,0.9fr)] lg:gap-14">
            <div>
              <figure className="m-0">
                <Image
                  src="/prathmesh-gupta.jpeg"
                  alt="Prathmesh Jaiprakash Gupta"
                  width={1200}
                  height={1200}
                  className="aspect-[1/1.02] w-full max-w-60 border border-line object-cover object-center"
                  sizes="240px"
                />
                <figcaption className="mt-3 text-sm leading-6 text-ink/68">
                  Prathmesh Jaiprakash Gupta
                  <br />
                  SEBI-Registered Research Analyst &middot; {raProfile.sebiRegistrationNumber}
                  <br />
                  Registered 4 June 2026
                </figcaption>
              </figure>

              <Link
                href="/strategies"
                className="mt-6 inline-flex min-h-10 items-center justify-center border border-ink/36 bg-transparent px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine"
              >
                Read the baskets
              </Link>

              <blockquote className="mt-6 border-t border-line pt-5">
                <p className="max-w-md font-serif text-xl leading-8 text-ink">
                  &ldquo;Most investors don&apos;t lose money by picking the wrong stock. They lose it by buying after a rally and selling into a fall.&rdquo;
                </p>
                <footer className="mt-3 text-sm leading-6 text-ink/68">
                  Prathmesh Jaiprakash Gupta, SEBI-Registered Research Analyst
                </footer>
              </blockquote>
            </div>

            <div className="space-y-5 text-base leading-8 text-ink sm:text-lg">
              <p>
                I started Vriksha because I kept seeing the same thing. People bought good companies
                and still lost money. They hadn&apos;t picked badly. They bought after the stock had run
                and sold when it fell.
              </p>
              <p>
                Markets have paid people well for a few things, for a long time. Stocks that have been
                rising tend to keep rising for a while. Money spread across assets that don&apos;t fall
                together takes less damage when one of them does. These aren&apos;t my opinions. They show
                up in decades of data across many countries, studied by people far more patient than me.
              </p>
              <p>
                Knowing this has never been the hard part. Acting on it when your gut says the opposite is.
              </p>
              <p>
                So we wrote it down. Each Vriksha basket is a rule. The rule decides what to own and
                when to change it. You get the trades as a file and place them in your own demat in
                about fifteen minutes. Your money never leaves your hands. You pay one flat fee, and
                we earn nothing from what you buy.
              </p>
              <p>
                Will a rule lose money in some months? Yes. Every honest strategy does. What it won&apos;t
                do is panic, and over years that is where most money is made or lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-10 sm:py-12">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Contact</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Research Desk</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-ink/68">
                Use this form for subscriber support, institutional inquiries, compliance requests,
                and strategy onboarding.
              </p>
              <div className="mt-6 rounded border border-line bg-paper p-5 text-sm leading-6 text-ink/70">
                <p className="font-semibold text-ink">{raProfile.registeredOffice.telephone}</p>
                <p className="mt-1 break-all">{raProfile.registeredOffice.email}</p>
                <p className="mt-3">{raProfile.registeredOffice.address}</p>
              </div>
            </div>
            <ContactMailForm />
          </div>
        </div>
      </section>
    </main>
  );
}
