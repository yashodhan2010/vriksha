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
import { PerformanceStatus } from "@/components/performance-status";
import { StrategyBacktestLink } from "@/components/strategy-backtest-link";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { StrategyCardLink } from "@/components/strategy-card-link";
import { getStrategyPath, strategies } from "@/lib/data";
import { formatMoney, getStrategyPrice } from "@/lib/pricing";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "@/lib/strategy-taxonomy";
import type { StrategyFamily } from "@/lib/strategy-taxonomy";
import { raProfile } from "@/lib/compliance";

function isHomeStrategy(strategy: { name: string; public_name?: string }) {
  const displayName = strategy.public_name ?? strategy.name;
  return !/^Bamboo\s+Trunk\b/i.test(displayName)
    && !/^Bamboo\s+Root$/i.test(displayName);
}

function getMinimumCapitalLabel(value: string) {
  const match = value.match(/(?:INR|Rs\.?|₹)?\s*([0-9,]+)(?:\s*lakh|\s*L)?/i);
  if (!match) return value || "Not specified";

  if (/lakh|L/i.test(value) && match[1] === "1") return "₹1,00,000";
  return `₹${match[1]}`;
}

function getRiskLevel(family: StrategyFamily, editionLabel: string) {
  if (family === "Mahogany") return "Moderate";
  if (/Root/i.test(editionLabel)) return "High";
  if (/Canopy/i.test(editionLabel)) return "High";
  return "Moderate-high";
}

function getInvestmentHorizon(_family: StrategyFamily) {
  return "3Y+";
}

const homeFaqs = [
  {
    question: "Is this a mutual fund or a PMS?",
    answer: "No. It is a research subscription. You keep your own demat and place your own trades. We never pool or manage your money."
  },
  {
    question: "Are all your baskets evidence-based, or just some?",
    answer: "All of them. Every basket follows published, rules-based logic drawn from long-documented market behaviour: momentum, disciplined multi-asset diversification, or both."
  },
  {
    question: "What do I actually receive?",
    answer: "On each basket's schedule: updated weights, a short note on what changed and why, and a broker-ready order file you can use with your broker."
  },
  {
    question: "How much work is it for me?",
    answer: "About 15 minutes on a rebalance day for most baskets. Import the file, place the orders in your own account, and verify the fills."
  },
  {
    question: "Do you show past performance?",
    answer: "Strategy pages include backtest and performance sections after risk acknowledgement. Backtested returns are illustrative and do not guarantee future returns."
  },
  {
    question: "Do you ever hold my money or trade for me?",
    answer: "Never. Your money stays in your own demat, and we never ask for your trading password or OTP. If anyone claiming to be us does, it is not us."
  },
  {
    question: "What does it cost?",
    answer: "A flat monthly fee based on the basket. No commission, no percentage of your money, and no exit load."
  },
  {
    question: "Can I stop?",
    answer: "Yes. You can cancel with one email and receive a pro-rata refund for the unexpired term, subject to the subscription terms."
  },
  {
    question: "Where do I actually pay?",
    answer: "On the Vriksha site after login and KYC. Payment is handled through the configured payment gateway when online checkout is available."
  }
];

export default function HomePage() {
  const featured =
    strategies.find((strategy) => strategy.slug === "dual-momentum")
    ?? strategies.find((strategy) => /Bamboo Canopy/i.test(strategy.public_name ?? strategy.name))
    ?? strategies[0];
  const homeStrategies = strategies
    .filter(isHomeStrategy)
    .sort((a, b) => {
      if (a.slug === featured.slug) return -1;
      if (b.slug === featured.slug) return 1;
      return 0;
    });
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
              <div className="hero-flow relative mt-4 overflow-hidden px-1 py-1">
                <div className="space-y-3">
                  {heroSteps.map(([step, title, text], index) => (
                    <div className="hero-flow-step grid grid-cols-[38px_1fr] gap-3 rounded border border-white/10 bg-[#f7f4ef] p-3 text-pine shadow-sm" key={step} style={{ animationDelay: `${160 + index * 120}ms` }}>
                      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-pine/20 bg-white text-[11px] font-semibold text-pine shadow-sm">
                        {step}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{title}</h3>
                        <p className="mt-1 text-xs leading-5 text-ink/66">{text}</p>
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

          .landing-hero .hero-flow-step {
            opacity: 0;
            transform: translateY(8px);
            animation: hero-flow-step 520ms ease-out forwards;
          }

          @keyframes hero-enter {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
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
            .landing-hero .hero-flow-step {
              animation: none;
              opacity: 1;
              transform: none;
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

        <div className="grid gap-4 md:grid-cols-2">
          {homeStrategies.map((strategy) => {
            const strategyFamily = getFamilyMeta(getStrategyFamily(strategy));
            const edition = getEditionMeta(getStrategyEdition(strategy));
            const isFlagship = strategy.slug === featured.slug;

            return (
              <article
                className="group relative overflow-hidden rounded border border-line bg-[#fffaf4] p-6 shadow-xs transition duration-250 ease-out hover:-translate-y-1 hover:border-pine/35 hover:bg-white hover:shadow-sm active:translate-y-0 focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/30"
                key={strategy.slug}
              >
                <StrategyCardLink
                  className="absolute inset-0 z-10 rounded"
                  href={getStrategyPath(strategy)}
                  strategySlug={strategy.slug}
                  strategyFamily={strategyFamily.label}
                  ariaLabel={`Explore ${strategy.name} strategy and backtest`}
                >
                  <span className="sr-only">Explore {strategy.name} strategy and backtest</span>
                </StrategyCardLink>
                <div className="pointer-events-none relative z-20 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded bg-pine/10 px-3 py-1 text-pine">{strategyFamily.label}</span>
                      <span className="rounded bg-gold/20 px-3 py-1 text-ink/72">{edition.label}</span>
                      {isFlagship && <span className="rounded bg-clay/10 px-3 py-1 uppercase tracking-[0.12em] text-clay">Flagship</span>}
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
                <div className="pointer-events-none relative z-20 mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    ["Role", strategyFamily.signal],
                    ["Risk", getRiskLevel(getStrategyFamily(strategy), edition.label)],
                    ["Horizon", getInvestmentHorizon(getStrategyFamily(strategy))],
                    ["Rebalance", strategy.rebalanceFrequency],
                    ["Holdings", `${strategy.targetHoldings}`],
                    ["Capital", getMinimumCapitalLabel(strategy.minCapital)]
                  ].map(([label, value]) => (
                    <div className="rounded border border-line bg-white px-3 py-2" key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ink/44">{label}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-ink/74">{value}</p>
                    </div>
                  ))}
                </div>
                <StrategyBacktestLink
                  className="relative z-30 mt-5 grid grid-cols-[1fr_auto] items-center gap-3 rounded border border-pine/20 bg-pine/[0.05] p-4 text-sm transition duration-180 hover:border-pine/40 hover:bg-pine/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                  href={`${getStrategyPath(strategy)}#backtest`}
                  strategySlug={strategy.slug}
                  strategyFamily={strategyFamily.label}
                >
                  <div>
                    <p className="font-semibold text-pine">Performance available</p>
                    <PerformanceStatus strategy={strategy} />
                    <p className="mt-1 text-ink/60">
                      Review growth, drawdowns, risk metrics and benchmark comparison after acknowledging the backtest limitations.
                    </p>
                  </div>
                  <LockKeyhole size={18} className="text-pine" aria-hidden="true" />
                </StrategyBacktestLink>
                <div className="pointer-events-none relative z-20 mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {formatMoney(getStrategyPrice(strategy.slug, "monthly").amountPaise)} / month
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center justify-center gap-2 rounded bg-pine px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-180 group-hover:bg-ink">
                      Explore strategy &amp; backtest
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                    <div className="pointer-events-auto relative z-30">
                      <StrategyBasketButton slug={strategy.slug} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="analyst" className="border-y border-line bg-white py-12 sm:py-16">
        <div className="container-page">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">The analyst</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">A note from the analyst</h2>
          </div>

          <div className="card-accent-gold grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(220px,0.38fr)_minmax(0,1fr)] lg:gap-8">
            <div>
              <figure className="m-0">
                <Image
                  src="/prathmesh-gupta.jpeg"
                  alt="Prathmesh Jaiprakash Gupta"
                  width={1200}
                  height={1200}
                  className="aspect-[1/1.02] w-full max-w-56 rounded border border-line object-cover object-center"
                  sizes="224px"
                />
                <figcaption className="mt-4 text-sm leading-6 text-ink/68">
                  <strong className="font-semibold text-ink">Prathmesh Jaiprakash Gupta</strong>
                  <br />
                  SEBI-Registered Research Analyst &middot; {raProfile.sebiRegistrationNumber}
                  <br />
                  M.A Applied Economics, University of Michigan-Ann Arbor
                  <br />
                  GSTIN 27BOUPG0104E1ZA
                  <br />
                  Registered 4 June 2026
                </figcaption>
              </figure>
            </div>

            <div className="max-w-3xl space-y-4 text-base leading-8 text-ink/72">
              <p>
                I started Vriksha because I kept seeing the same thing. People bought good companies
                and still lost money. They hadn&apos;t picked badly. They bought after the stock had run
                and sold when it fell.
              </p>
              <p>
                Markets have paid people well for a few things, for a long time. Stocks that have been
                rising tend to keep rising for a while. Money spread across assets that don&apos;t fall
                together takes lesser damage than a single asset does. These aren&apos;t my opinions. They show
                up in decades of data across many countries, studied by people far more patient than me.
              </p>
              <p>
                Knowing this has never been the hard part. Acting on it when your gut says the opposite is.
              </p>
              <p>
                So we wrote it down. Each Vriksha basket is a rules based portfolio. These rules decide what to own and
                when to change it. You get the trades as a file and place them on your own. Your money never leaves your account.
                You pay one subscription fee.
              
              </p>
              <p>
                Will a rule lose money in some months? Yes. Every honest strategy does. What it won&apos;t
                do is panic, and over years that is where most money is made or lost.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-line bg-paper py-10 sm:py-12">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.42fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">FAQs</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Questions people ask</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-ink/68">
                Short answers on structure, custody, work involved, payment and exit.
              </p>
            </div>
            <div className="grid gap-3">
              {homeFaqs.map((item) => (
                <details
                  className="group rounded border border-line bg-[#fffaf4] p-4 shadow-xs transition duration-180 open:bg-white"
                  key={item.question}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                    {item.question}
                    <ArrowDown className="shrink-0 text-pine transition-transform duration-180 group-open:rotate-180" size={15} aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-ink/68">{item.answer}</p>
                </details>
              ))}
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
                <p className="font-semibold text-ink">Email</p>
                <p className="mt-1 break-all">{raProfile.registeredOffice.email}</p>
              </div>
            </div>
            <ContactMailForm />
          </div>
        </div>
      </section>
    </main>
  );
}
