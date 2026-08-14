"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function StrategyBacktestLink({
  href,
  strategySlug,
  strategyFamily,
  children,
  className
}: {
  href: string;
  strategySlug: string;
  strategyFamily: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      className={className}
      href={href}
      onClick={(event) => {
        event.stopPropagation();
        trackEvent("strategy_backtest_link_click", {
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
