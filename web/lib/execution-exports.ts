import type { Strategy } from "./types";

export type ExecutionSubscriptionRow = {
  strategy_slug: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
};

type CsvValue = string | number | null | undefined;

export const latestModelPortfolioHeaders = ["symbol", "company", "sector", "marketcap", "weight", "note"];
export const rebalanceHistoryHeaders = ["date", "symbol", "action", "old_weight", "new_weight", "summary"];

function csvEscape(value: CsvValue) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: CsvValue[][]) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

export function hasCurrentActiveSubscription(row: ExecutionSubscriptionRow, now = Date.now()) {
  if (row.status !== "active") return false;

  const startsAt = row.starts_at ? new Date(row.starts_at).getTime() : Number.NEGATIVE_INFINITY;
  const endsAt = row.ends_at ? new Date(row.ends_at).getTime() : Number.POSITIVE_INFINITY;

  return startsAt <= now && endsAt > now;
}

export function hasActiveSubscriptionForStrategy(
  rows: ExecutionSubscriptionRow[],
  strategySlug: string,
  now = Date.now()
) {
  return rows.some(
    (row) => row.strategy_slug === strategySlug && hasCurrentActiveSubscription(row, now)
  );
}

export function buildExecutionSubscriptions(
  allStrategies: Strategy[],
  rows: ExecutionSubscriptionRow[],
  now = Date.now()
) {
  const strategyBySlug = new Map(allStrategies.map((strategy) => [strategy.slug, strategy]));
  const seen = new Set<string>();

  return rows
    .filter((row) => hasCurrentActiveSubscription(row, now))
    .map((row) => strategyBySlug.get(row.strategy_slug))
    .filter((strategy): strategy is Strategy => Boolean(strategy))
    .filter((strategy) => {
      if (seen.has(strategy.slug)) return false;
      seen.add(strategy.slug);
      return true;
    })
    .map((strategy) => {
      const latestRebalance = strategy.rebalances[0] ?? null;

      return {
        strategy_id: strategy.slug,
        strategy_name: strategy.name,
        status: "active",
        latest_model_as_of: latestRebalance?.date ?? "",
        latest_rebalance_date: latestRebalance?.date ?? ""
      };
    });
}

export function buildLatestModelPortfolioCsv(strategy: Strategy) {
  const rows = strategy.holdings.map((holding) => [
    holding.symbol,
    holding.company,
    holding.sector,
    holding.marketcap,
    holding.weight,
    holding.note
  ]);

  return toCsv(latestModelPortfolioHeaders, rows);
}

export function buildRebalanceHistoryCsv(strategy: Strategy) {
  const rows = strategy.rebalances.flatMap((rebalance) =>
    rebalance.changes.map((change) => [
      rebalance.date,
      change.symbol,
      change.action,
      change.oldWeight,
      change.newWeight,
      rebalance.summary
    ])
  );

  return toCsv(rebalanceHistoryHeaders, rows);
}
