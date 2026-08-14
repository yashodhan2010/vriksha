"use client";

import Link from "next/link";
import type React from "react";
import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName, type AnalyticsProperties } from "@/lib/analytics";

export function DashboardEventTracker({
  event,
  properties
}: {
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
}) {
  useEffect(() => {
    trackEvent(event, properties);
  }, [event, properties]);

  return null;
}

export function DashboardTrackedLink({
  href,
  className,
  event,
  properties,
  children,
  download
}: {
  href: string;
  className?: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
  children: React.ReactNode;
  download?: boolean;
}) {
  return (
    <Link
      className={className}
      download={download}
      href={href}
      onClick={() => trackEvent(event, properties)}
    >
      {children}
    </Link>
  );
}
