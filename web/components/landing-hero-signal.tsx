import type { Strategy } from "@/lib/types";

type LandingHeroSignalProps = {
  strategy: Strategy;
};

function methodLabel(strategy: Strategy) {
  const labels = strategy.labels.join(" ").toLowerCase();
  if (labels.includes("momentum")) return "Rules-based momentum";
  if (labels.includes("asset")) return "Rules-based allocation";
  return "Rules-based research";
}

export function LandingHeroSignal({ strategy }: LandingHeroSignalProps) {
  const facts = [
    { label: "Universe", value: strategy.universe },
    { label: "Target holdings", value: String(strategy.targetHoldings) },
    { label: "Rebalancing", value: strategy.rebalanceFrequency },
    { label: "Method", value: methodLabel(strategy) }
  ];

  return (
    <div className="landing-signal rounded border border-white/12 bg-[#f7f4ef] p-4 text-ink shadow-lift sm:p-5">
      <svg
        className="h-auto w-full"
        viewBox="0 0 520 260"
        role="img"
        aria-label="Conceptual signal filtering into a model portfolio allocation"
      >
        <defs>
          <linearGradient id="signalLine" x1="40" x2="480" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a55f45" />
            <stop offset="0.5" stopColor="#c39b43" />
            <stop offset="1" stopColor="#1f3a33" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#18211f" floodOpacity="0.13" />
          </filter>
        </defs>

        <g className="signal-inputs" fill="none" stroke="#a55f45" strokeLinecap="round" strokeWidth="2">
          <path d="M46 64 C76 38 103 92 132 62" />
          <path d="M42 116 C70 96 92 130 128 108" />
          <path d="M50 170 C78 148 108 184 138 156" />
        </g>

        <g className="signal-dots" fill="#a55f45">
          <circle cx="52" cy="64" r="4" />
          <circle cx="94" cy="74" r="4" />
          <circle cx="130" cy="62" r="4" />
          <circle cx="58" cy="116" r="4" />
          <circle cx="112" cy="114" r="4" />
          <circle cx="70" cy="166" r="4" />
          <circle cx="132" cy="160" r="4" />
        </g>

        <g className="filter-layer" filter="url(#softShadow)">
          <rect x="188" y="44" width="92" height="156" rx="10" fill="#fffaf4" stroke="#ded8cd" />
          <path d="M208 84 H260" stroke="#1f3a33" strokeOpacity="0.32" strokeWidth="2" />
          <path d="M208 116 H260" stroke="#1f3a33" strokeOpacity="0.58" strokeWidth="2" />
          <path d="M208 148 H260" stroke="#1f3a33" strokeOpacity="0.42" strokeWidth="2" />
          <circle cx="234" cy="184" r="5" fill="#c39b43" />
        </g>

        <g className="selected-flow" fill="none" stroke="url(#signalLine)" strokeLinecap="round" strokeWidth="3">
          <path d="M138 62 C166 62 171 82 188 84" />
          <path d="M136 158 C162 150 171 122 188 116" />
          <path d="M280 84 C310 84 317 114 348 116" />
          <path d="M280 148 C316 148 319 178 348 176" />
        </g>

        <g className="portfolio-bars" filter="url(#softShadow)">
          <rect x="350" y="72" width="22" height="120" rx="5" fill="#1f3a33" />
          <rect x="382" y="102" width="22" height="90" rx="5" fill="#476252" />
          <rect x="414" y="88" width="22" height="104" rx="5" fill="#c39b43" />
          <rect x="446" y="120" width="22" height="72" rx="5" fill="#a55f45" />
          <rect x="478" y="108" width="22" height="84" rx="5" fill="#d6b96a" />
        </g>

        <g className="portfolio-base">
          <path d="M342 206 H506" stroke="#1f3a33" strokeOpacity="0.45" strokeWidth="2" />
          <path d="M352 224 H494" stroke="#ded8cd" strokeWidth="8" strokeLinecap="round" />
        </g>
      </svg>

      <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-ink/58">
        Systematic selection. Defined allocation. Scheduled rebalancing.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line text-sm">
        {facts.map((fact) => (
          <div className="bg-[#fffaf4] p-3" key={fact.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/46">{fact.label}</dt>
            <dd className="mt-1 font-semibold text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <style>{`
        .landing-signal .signal-inputs path,
        .landing-signal .selected-flow path {
          stroke-dasharray: 180;
          stroke-dashoffset: 180;
          animation: signal-draw 900ms ease-out forwards;
        }

        .landing-signal .signal-inputs path:nth-child(2) { animation-delay: 120ms; }
        .landing-signal .signal-inputs path:nth-child(3) { animation-delay: 220ms; }
        .landing-signal .selected-flow path { animation-delay: 640ms; }
        .landing-signal .selected-flow path:nth-child(2) { animation-delay: 760ms; }
        .landing-signal .selected-flow path:nth-child(3) { animation-delay: 960ms; }
        .landing-signal .selected-flow path:nth-child(4) { animation-delay: 1080ms; }

        .landing-signal .signal-dots circle,
        .landing-signal .filter-layer,
        .landing-signal .portfolio-bars rect {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: signal-settle 560ms ease-out forwards;
        }

        .landing-signal .signal-dots circle { animation-delay: 260ms; }
        .landing-signal .filter-layer { animation-delay: 520ms; }
        .landing-signal .portfolio-bars rect { animation-delay: 1260ms; }
        .landing-signal .portfolio-bars rect:nth-child(2) { animation-delay: 1360ms; }
        .landing-signal .portfolio-bars rect:nth-child(3) { animation-delay: 1460ms; }
        .landing-signal .portfolio-bars rect:nth-child(4) { animation-delay: 1560ms; }
        .landing-signal .portfolio-bars rect:nth-child(5) { animation-delay: 1660ms; }

        @keyframes signal-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes signal-settle {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-signal .signal-inputs path,
          .landing-signal .selected-flow path,
          .landing-signal .signal-dots circle,
          .landing-signal .filter-layer,
          .landing-signal .portfolio-bars rect {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
