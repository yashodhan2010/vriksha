"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Wraps a section-level block of content and fades/lifts it in once it
 * scrolls into view. Intentionally simple (IntersectionObserver + CSS
 * transition) rather than a motion library, since the effect only needs
 * opacity + transform on mount-into-view — no springs, gestures, or
 * orchestration are required.
 *
 * Always renders its children (SSR-safe); JS only adds a visual transition.
 * Respects prefers-reduced-motion and degrades to fully visible when
 * IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const revealIfNearViewport = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (revealIfNearViewport()) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 120px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "reveal-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
