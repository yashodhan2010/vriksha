export function GrowthMotif({ className = "" }: { className?: string }) {
  const rings = [42, 78, 114, 150, 186, 222, 258];

  return (
    <svg
      className={`growth-motif ${className}`}
      viewBox="0 0 420 420"
      aria-hidden="true"
      focusable="false"
    >
      <g className="growth-rings" fill="none" stroke="currentColor" strokeOpacity="0.42">
        {rings.map((radius) => (
          <circle key={radius} cx="330" cy="90" r={radius} />
        ))}
      </g>
      <g className="growth-branches" stroke="currentColor" strokeOpacity="0.62" strokeWidth="1.4" strokeLinecap="round">
        <path d="M330 90 L330 260" />
        <path d="M330 150 L286 196" />
        <path d="M330 150 L374 196" />
        <path d="M330 196 L300 240" />
        <path d="M330 196 L360 240" />
        <path d="M330 240 L330 300" />
        <path d="M286 196 L250 184" />
        <path d="M374 196 L396 168" />
      </g>
      <g className="growth-nodes" fill="currentColor">
        <circle cx="330" cy="150" r="4" />
        <circle cx="286" cy="196" r="3.5" />
        <circle cx="374" cy="196" r="3.5" />
        <circle cx="330" cy="240" r="3" />
      </g>
      <style>{`
        .growth-motif .growth-rings circle,
        .growth-motif .growth-branches path {
          stroke-dasharray: 1800;
          stroke-dashoffset: 1800;
          animation: growth-draw 1500ms ease-out forwards;
        }

        .growth-motif .growth-rings circle:nth-child(2) { animation-delay: 80ms; }
        .growth-motif .growth-rings circle:nth-child(3) { animation-delay: 140ms; }
        .growth-motif .growth-rings circle:nth-child(4) { animation-delay: 200ms; }
        .growth-motif .growth-rings circle:nth-child(5) { animation-delay: 260ms; }
        .growth-motif .growth-rings circle:nth-child(6) { animation-delay: 320ms; }
        .growth-motif .growth-rings circle:nth-child(7) { animation-delay: 380ms; }
        .growth-motif .growth-branches path { animation-delay: 360ms; }

        .growth-motif .growth-nodes circle {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: growth-node 700ms ease-out forwards;
          animation-delay: 980ms;
        }

        .growth-motif .growth-nodes circle:nth-child(2) { animation-delay: 1120ms; }
        .growth-motif .growth-nodes circle:nth-child(3) { animation-delay: 1240ms; }
        .growth-motif .growth-nodes circle:nth-child(4) { animation-delay: 1360ms; }

        @keyframes growth-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes growth-node {
          0% { opacity: 0; transform: scale(0.7); }
          60% { opacity: 0.82; transform: scale(1.12); }
          100% { opacity: 0.5; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .growth-motif .growth-rings circle,
          .growth-motif .growth-branches path,
          .growth-motif .growth-nodes circle {
            animation: none;
            opacity: 0.5;
            stroke-dashoffset: 0;
            transform: none;
          }
        }
      `}</style>
    </svg>
  );
}
