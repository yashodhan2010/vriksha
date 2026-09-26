import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Strategy } from "./types";

// Never import the private artifact into a client bundle or production build.
export function withPerformancePreview<T extends Strategy | undefined>(strategy: T): T {
  if (!strategy || process.env.NODE_ENV !== "development" || process.env.VRIKSHA_PERFORMANCE_PREVIEW !== "1") return strategy;
  try {
    const previews = JSON.parse(readFileSync(join(process.cwd(), "lib/imported-strategies.preview.json"), "utf8")) as Array<Partial<Strategy>>;
    const preview = previews.find((item) => item.slug === strategy.slug);
    if (!preview) return strategy;
    // Allowlist performance fields; holdings and portfolio dates cannot be overridden.
    const { dailyReturns, updatedThrough, transitionDate, performanceStatus, metrics, monthlyReturns, yearlyReturns, drawdowns, benchmarkComparisons } = preview;
    if (performanceStatus === "unavailable") return { ...strategy, performanceStatus };
    if (performanceStatus !== "internal_preview" || !dailyReturns?.length) return strategy;
    return { ...strategy, dailyReturns, updatedThrough, transitionDate, performanceStatus, metrics, monthlyReturns, yearlyReturns, drawdowns, benchmarkComparisons } as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Could not load performance preview", error);
    return strategy;
  }
}
