"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function StrategyCardLink({
  href,
  strategySlug,
  strategyFamily,
  children,
  className,
  ariaLabel
}: {
  href: string;
  strategySlug: string;
  strategyFamily: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  useEffect(() => {
    trackEvent("strategy_card_view", {
      strategySlug,
      strategyFamily
    });
  }, [strategyFamily, strategySlug]);

  return (
    <Link
      className={className}
      href={href}
      aria-label={ariaLabel}
      onClick={() => {
        trackEvent("strategy_card_open", {
          strategySlug,
          strategyFamily,
          destination: href
        });
      }}
    >
      {children}
    </Link>
  );
}
