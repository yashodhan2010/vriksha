"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Compass,
  FileText,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";

type RoadmapStep = {
  step: string;
  title: string;
  text: string;
  href: string;
  action: string;
  icon: LucideIcon;
  visual: "segments" | "cards" | "research" | "shield" | "rebalance";
  surface: string;
  activeSurface: string;
  completedSurface: string;
  activeNode: string;
};

const processSteps: RoadmapStep[] = [
  {
    step: "01",
    title: "Choose the portfolio role",
    text: "Start with the job your next strategy needs to do: core, growth, stability, or balance.",
    href: "#portfolio-needs",
    action: "Go to selector",
    icon: Compass,
    visual: "segments",
    surface: "bg-[#fffaf4]",
    activeSurface: "bg-[#fbf6ee]",
    completedSurface: "bg-[#fffaf4]",
    activeNode: "bg-[#6f7d61]"
  },
  {
    step: "02",
    title: "Select products",
    text: "Use the catalog filter to compare matching strategy families and editions.",
    href: "/strategies",
    action: "Open catalog",
    icon: ShoppingBag,
    visual: "cards",
    surface: "bg-[#f8f3ea]",
    activeSurface: "bg-[#f1f4eb]",
    completedSurface: "bg-[#f8f3ea]",
    activeNode: "bg-[#5c735c]"
  },
  {
    step: "03",
    title: "Read public research",
    text: "Review methodology, risks, benchmark, and backtest access prompts before subscribing.",
    href: "/strategies",
    action: "Browse strategies",
    icon: FileText,
    visual: "research",
    surface: "bg-[#f2f4ea]",
    activeSurface: "bg-[#e8f0e8]",
    completedSurface: "bg-[#f2f4ea]",
    activeNode: "bg-[#496a55]"
  },
  {
    step: "04",
    title: "Acknowledge risk and subscribe",
    text: "Verify, acknowledge the required disclosures, and subscribe to unlock model portfolio access.",
    href: "/strategies",
    action: "Choose a strategy",
    icon: ShieldCheck,
    visual: "shield",
    surface: "bg-[#e9efe6]",
    activeSurface: "bg-[#dfe9df]",
    completedSurface: "bg-[#e9efe6]",
    activeNode: "bg-[#365845]"
  },
  {
    step: "05",
    title: "Follow rebalances",
    text: "Track published rebalance updates and research notes as the model portfolio evolves.",
    href: "/strategies",
    action: "View live strategies",
    icon: RefreshCw,
    visual: "rebalance",
    surface: "bg-[#dfe8df]",
    activeSurface: "bg-[#d3e1d4]",
    completedSurface: "bg-[#dfe8df]",
    activeNode: "bg-pine"
  }
];

function StepVisual({ type, active, completed }: { type: RoadmapStep["visual"]; active: boolean; completed: boolean }) {
  const stateClass = active || completed ? "opacity-100" : "opacity-55";

  if (type === "segments") {
    return (
      <div className={cn("relative h-24 w-32", stateClass)} aria-hidden="true">
        {[
          "left-1 top-6 bg-gold/30",
          "left-12 top-2 bg-pine/12",
          "left-16 top-12 bg-sky",
          "left-24 top-7 bg-clay/18"
        ].map((classes, index) => (
          <span
            className={cn(
              "absolute grid h-10 w-10 place-items-center rounded border border-line transition duration-500",
              classes,
              active && index === 1 && "scale-110 border-pine bg-pine text-white"
            )}
            key={classes}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-50" />
          </span>
        ))}
        <span className={cn("absolute left-9 top-10 h-px w-16 bg-pine/35 transition duration-500", active && "w-20")} />
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className={cn("relative h-24 w-32", stateClass)} aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <span
            className={cn(
              "absolute left-4 h-14 w-20 rounded border border-line bg-white shadow-xs transition duration-500",
              active ? "translate-x-5" : "",
              item === 0 && "top-3 rotate-[-4deg]",
              item === 1 && "left-7 top-8",
              item === 2 && "left-1 top-12 rotate-[3deg]"
            )}
            key={item}
          >
            <span className="m-2 block h-2 w-10 rounded bg-pine/18" />
            <span className="mx-2 mt-2 block h-1.5 w-14 rounded bg-line" />
          </span>
        ))}
      </div>
    );
  }

  if (type === "research") {
    return (
      <svg className={cn("h-24 w-32", stateClass)} viewBox="0 0 128 96" aria-hidden="true">
        <rect x="28" y="10" width="70" height="76" rx="8" fill="#fffaf4" stroke="#ded8cd" />
        <path d="M42 31h28M42 43h42M42 55h20" stroke="#ded8cd" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M42 70 C52 58 58 78 68 63 S84 58 90 48"
          fill="none"
          stroke="#1f3a33"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="68"
          strokeDashoffset={active || completed ? "0" : "68"}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg className={cn("h-24 w-32", stateClass)} viewBox="0 0 128 96" aria-hidden="true">
        <path
          d="M64 12 96 25v21c0 21-12 33-32 42-20-9-32-21-32-42V25l32-13Z"
          fill="#fffaf4"
          stroke="#ded8cd"
          strokeWidth="2"
        />
        <path
          d="m50 49 10 10 22-26"
          fill="none"
          stroke="#1f3a33"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="50"
          strokeDashoffset={active || completed ? "0" : "50"}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
    );
  }

  return (
    <div className={cn("flex h-24 w-32 items-end gap-2 rounded bg-paper/60 p-4", stateClass)} aria-hidden="true">
      {[44, 70, 38, 58].map((height) => (
        <span className="flex flex-1 flex-col justify-end gap-1" key={height}>
          <span
            className="rounded-t bg-pine/70 transition-all duration-700"
            style={{ height: `${active || completed ? height + 8 : height}%` }}
          />
          <span
            className="rounded-t bg-gold/45 transition-all duration-700"
            style={{ height: `${active || completed ? 86 - height : 24}%` }}
          />
        </span>
      ))}
    </div>
  );
}

export function HowItWorksRoadmap() {
  const refs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      setSeen(new Set(processSteps.map((_, index) => index)));
      setActiveIndex(processSteps.length - 1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.index);
        setActiveIndex(index);
        setSeen((current) => new Set([...current, index]));
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-20% 0px -35% 0px" }
    );

    refs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [reducedMotion]);

  const progress = reducedMotion ? 100 : ((Math.max(activeIndex, 0) + 1) / processSteps.length) * 100;

  return (
    <section id="how-it-works" className="container-page section-tight overflow-hidden">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm uppercase tracking-[0.18em] text-clay">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold">From portfolio need to rebalance</h2>
          <p className="mt-4 text-sm leading-6 text-ink/68">
            A guided path keeps the experience focused: first choose the role, then compare matching research products.
          </p>
          <Link
            href="#portfolio-needs"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-pine hover:border-pine/40 hover:bg-paper"
          >
            Start with portfolio need <ArrowDown size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative rounded bg-white/34 px-1 py-2 sm:px-4">
          <div className="pointer-events-none absolute bottom-14 left-5 top-14 hidden w-20 sm:block" aria-hidden="true">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 80 100">
              <path d="M42 0 C18 18 62 30 38 48 C18 63 56 74 36 100" fill="none" stroke="#ded8cd" strokeWidth="2" />
              <path
                d="M42 0 C18 18 62 30 38 48 C18 63 56 74 36 100"
                fill="none"
                stroke="#a55f45"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
          </div>

          <div className="space-y-7 sm:space-y-9">
            {processSteps.map((item, index) => {
              const Icon = item.icon;
              const active = activeIndex === index;
              const completed = seen.has(index) && activeIndex > index;
              const upcoming = !seen.has(index) && !active;
              const final = index === processSteps.length - 1;

              return (
                <article
                  className="group relative pl-14 sm:pl-24"
                  data-index={index}
                  key={item.step}
                  ref={(node) => {
                    refs.current[index] = node;
                  }}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-6 z-10 grid h-11 w-11 place-items-center rounded-full border bg-white text-pine shadow-xs transition duration-500 sm:left-3",
                      upcoming && "border-line text-ink/42",
                      active && `scale-110 border-pine ${item.activeNode} text-white shadow-[0_0_0_10px_rgba(31,58,51,0.08)]`,
                      completed && "border-pine bg-white text-pine"
                    )}
                  >
                    {completed ? <Check size={17} aria-hidden="true" /> : <Icon size={17} aria-hidden="true" />}
                  </span>

                  <Link
                    href={item.href}
                    className={cn(
                      "relative grid gap-4 overflow-hidden rounded border p-5 transition duration-500 sm:grid-cols-[64px_minmax(0,1fr)_132px] sm:items-center sm:p-6",
                      upcoming && `border-line ${item.surface} opacity-72 shadow-xs`,
                      active && `-translate-x-1 scale-[1.01] border-pine/30 ${item.activeSurface} shadow-soft`,
                      completed && `border-line ${item.completedSurface} shadow-xs`
                    )}
                  >
                    <span className={cn("pointer-events-none absolute -right-3 -top-5 font-serif text-7xl opacity-[0.045]", final && (active || completed) && "opacity-[0.08]")}>
                      {item.step}
                    </span>
                    <div>
                      <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", active ? "text-clay" : "text-clay/62")}>
                        {item.step}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-ink/68">{item.text}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pine">
                        {item.action}
                        <ArrowRight className="transition duration-180 group-hover:translate-x-1" size={14} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="hidden justify-self-end sm:block">
                      <StepVisual type={item.visual} active={active} completed={completed} />
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
