/**
 * Centralised motion system. There is no Framer Motion dependency in this
 * project — every interaction here (hover, focus, header scroll state,
 * mobile menu, scroll-reveal) is a plain CSS transition, which is enough
 * for opacity/transform/colour changes and keeps the client bundle small.
 * This module exists so the few places that need JS-driven timing
 * (chart draw-in, scroll-reveal) share one duration scale and one
 * reduced-motion check instead of duplicating the logic.
 */
export const motionDuration = {
  /** Hover/focus colour and background changes. */
  fast: 180,
  /** Card lift, header state changes. */
  base: 250,
  /** Scroll-reveal and chart entrance — the slowest motion in the app. */
  slow: 450
} as const;

export const motionEase = "ease-out";

/**
 * Synchronous, side-effect-free check for the user's reduced-motion
 * preference. Safe to call from inside a `useEffect` (client-only code
 * path); returns `false` during SSR since no motion has started yet there.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
