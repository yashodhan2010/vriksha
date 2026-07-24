/**
 * Purely decorative background motif for the hero — concentric growth rings
 * with a few branching lines, evoking compounding growth / the "Vriksha"
 * (tree) brand name. Low-contrast, static (no parallax/animation), and
 * removed from the accessibility tree since it carries no information.
 */
export function GrowthMotif({ className = "" }: { className?: string }) {
  const rings = [46, 84, 122, 160, 198, 236];

  return (
    <svg
      className={className}
      viewBox="0 0 420 420"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="white" strokeOpacity="0.08">
        {rings.map((radius) => (
          <circle key={radius} cx="330" cy="90" r={radius} />
        ))}
      </g>
      <g stroke="white" strokeOpacity="0.12" strokeWidth="1.5" strokeLinecap="round">
        <path d="M330 90 L330 260" />
        <path d="M330 150 L286 196" />
        <path d="M330 150 L374 196" />
        <path d="M330 196 L300 240" />
        <path d="M330 196 L360 240" />
        <path d="M330 240 L330 300" />
      </g>
    </svg>
  );
}
