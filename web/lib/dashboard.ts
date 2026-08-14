import { getCurrentUser, hasStrategyAccess } from "./access";
import { getStrategyPath, getStrategyPerformancePath, strategies } from "./data";
import { createSupabaseServerClient } from "./supabase/server";
import { getEditionMeta, getFamilyMeta, getStrategyEdition, getStrategyFamily } from "./strategy-taxonomy";
import type { PortfolioHolding, Rebalance, Strategy } from "./types";

type SubscriptionRow = {
  strategy_slug: string;
  status: string;
  source?: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at?: string | null;
};

type GrantRow = {
  strategy_slug: string;
  reason?: string | null;
  starts_at: string | null;
  ends_at: string | null;
  revoked_at?: string | null;
  created_at?: string | null;
};

type PaymentRow = {
  strategy_slug: string | null;
  amount_in_paise: number | null;
  currency: string | null;
  status: string;
  provider: string | null;
  created_at: string | null;
};

export type DashboardStrategy = {
  strategy: Strategy;
  family: string;
  edition: string;
  accessSource: "Subscription" | "Manual grant" | "Admin access";
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  latestModelDate: string | null;
  latestRebalance: Rebalance | null;
  nextExpectedRebalance: string | null;
  holdingsCount: number;
  unreadRebalance: boolean;
  strategyPath: string;
  performancePath: string;
};

export type DashboardAction = {
  title: string;
  body: string;
  href: string;
  tone: "gold" | "pine" | "clay";
};

export type DashboardDocument = {
  title: string;
  description: string;
  href: string;
  strategySlug: string;
  strategyName: string;
  kind: "portfolio" | "rebalance" | "strategy";
};

export type PortfolioRow = PortfolioHolding & {
  previousWeight: number;
  change: number;
  changeStatus: string;
};

export type DashboardData = {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  firstName: string;
  email: string;
  profileRole: string;
  kycStatus: string | null;
  kycVerifiedAt: string | null;
  strategies: DashboardStrategy[];
  actions: DashboardAction[];
  documents: DashboardDocument[];
  subscriptions: SubscriptionRow[];
  grants: GrantRow[];
  payments: PaymentRow[];
  nearestRenewal: string | null;
};

export function formatDashboardDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatWeight(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCurrencyFromPaise(amount: number | null | undefined, currency = "INR") {
  if (!amount) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount / 100);
}

export function getSelectedDashboardStrategy(data: DashboardData, slug?: string | string[] | null) {
  const selectedSlug = Array.isArray(slug) ? slug[0] : slug;
  return data.strategies.find((item) => item.strategy.slug === selectedSlug) ?? data.strategies[0] ?? null;
}

export function getPortfolioRows(strategy: Strategy): PortfolioRow[] {
  const latest = strategy.rebalances[0] ?? null;
  const changeBySymbol = new Map(latest?.changes.map((change) => [change.symbol, change]) ?? []);

  return strategy.holdings.map((holding) => {
    const change = changeBySymbol.get(holding.symbol);
    const previousWeight = change?.oldWeight ?? holding.weight;
    const changeValue = holding.weight - previousWeight;

    return {
      ...holding,
      previousWeight,
      change: changeValue,
      changeStatus: change?.action ?? "Unchanged"
    };
  });
}

export function getRebalanceCounts(rebalance: Rebalance | null) {
  const counts = {
    additions: 0,
    reductions: 0,
    exits: 0,
    unchanged: 0,
    increases: 0
  };

  rebalance?.changes.forEach((change) => {
    if (change.action === "Added") counts.additions += 1;
    else if (change.action === "Removed") counts.exits += 1;
    else if (change.action === "Reduced") counts.reductions += 1;
    else if (change.action === "Increased" || change.action === "Weight changed") counts.increases += 1;
    else counts.unchanged += 1;
  });

  return counts;
}

export function getSectorWeights(strategy: Strategy) {
  const sectors = new Map<string, number>();
  strategy.holdings.forEach((holding) => {
    sectors.set(holding.sector, (sectors.get(holding.sector) ?? 0) + holding.weight);
  });

  return Array.from(sectors.entries())
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);
}

function getFirstName(email: string, fullName?: string | null) {
  const source = fullName?.trim() || email.split("@")[0]?.replace(/[._-]+/g, " ");
  const first = source.split(" ").filter(Boolean)[0];
  if (!first) return "Subscriber";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function isCurrentRange(startsAt: string | null | undefined, endsAt: string | null | undefined) {
  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : Number.NEGATIVE_INFINITY;
  const end = endsAt ? new Date(endsAt).getTime() : Number.POSITIVE_INFINITY;
  return start <= now && end > now;
}

function getNextExpectedRebalance(strategy: Strategy, latest: Rebalance | null) {
  if (!latest?.date) return null;
  const lower = strategy.rebalanceFrequency.toLowerCase();
  const date = new Date(latest.date);
  if (Number.isNaN(date.getTime())) return null;

  if (lower.includes("quarter")) date.setMonth(date.getMonth() + 3);
  else if (lower.includes("twice") || lower.includes("bi")) date.setDate(date.getDate() + 15);
  else if (lower.includes("month")) date.setMonth(date.getMonth() + 1);
  else return `${strategy.rebalanceFrequency} cadence`;

  return date.toISOString();
}

function getStatusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function uniqueBySlug(items: DashboardStrategy[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.strategy.slug)) return false;
    seen.add(item.strategy.slug);
    return true;
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser();
  const empty: DashboardData = {
    user,
    firstName: "Subscriber",
    email: "",
    profileRole: "subscriber",
    kycStatus: null,
    kycVerifiedAt: null,
    strategies: [],
    actions: [],
    documents: [],
    subscriptions: [],
    grants: [],
    payments: [],
    nearestRenewal: null
  };

  if (!user) return empty;

  const email = user.email ?? "";
  const supabase = await createSupabaseServerClient();

  const [profileResult, subscriptionsResult, grantsResult, kycResult, paymentsResult] = supabase
    ? await Promise.all([
      supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("strategy_slug, status, source, starts_at, ends_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("strategy_access_grants")
        .select("strategy_slug, reason, starts_at, ends_at, revoked_at, created_at")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("kyc_profiles")
        .select("status, verified_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("payments")
        .select("strategy_slug, amount_in_paise, currency, status, provider, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
    ])
    : [null, null, null, null, null];

  const subscriptions = (subscriptionsResult?.data ?? []) as SubscriptionRow[];
  const grants = (grantsResult?.data ?? []) as GrantRow[];
  const payments = (paymentsResult?.data ?? []) as PaymentRow[];
  const profileRole = profileResult?.data?.role ?? "subscriber";
  const fullName = profileResult?.data?.full_name ?? null;
  const latestKyc = kycResult?.data ?? null;

  const accessPairs = await Promise.all(
    strategies.map(async (strategy) => ({
      strategy,
      canAccess: await hasStrategyAccess(strategy.slug)
    }))
  );

  const dashboardStrategies = uniqueBySlug(
    accessPairs
      .filter((item) => item.canAccess)
      .map(({ strategy }) => {
        const activeSubscription = subscriptions.find(
          (subscription) =>
            subscription.strategy_slug === strategy.slug
            && ["trialing", "active"].includes(subscription.status)
            && isCurrentRange(subscription.starts_at, subscription.ends_at)
        );
        const activeGrant = grants.find(
          (grant) => grant.strategy_slug === strategy.slug && isCurrentRange(grant.starts_at, grant.ends_at)
        );
        const latestRebalance = strategy.rebalances[0] ?? null;
        const family = getStrategyFamily(strategy);
        const edition = getStrategyEdition(strategy);

        return {
          strategy,
          family: getFamilyMeta(family).label,
          edition: getEditionMeta(edition).label,
          accessSource: activeSubscription ? "Subscription" : activeGrant ? "Manual grant" : "Admin access",
          status: activeSubscription ? getStatusLabel(activeSubscription.status) : activeGrant ? "Granted" : "Unlocked",
          startsAt: activeSubscription?.starts_at ?? activeGrant?.starts_at ?? null,
          endsAt: activeSubscription?.ends_at ?? activeGrant?.ends_at ?? null,
          latestModelDate: latestRebalance?.date ?? null,
          latestRebalance,
          nextExpectedRebalance: getNextExpectedRebalance(strategy, latestRebalance),
          holdingsCount: strategy.holdings.length,
          unreadRebalance: Boolean(latestRebalance),
          strategyPath: getStrategyPath(strategy),
          performancePath: getStrategyPerformancePath(strategy)
        } satisfies DashboardStrategy;
      })
  );

  const expiringAccess = dashboardStrategies
    .filter((item) => item.endsAt)
    .map((item) => ({ item, time: new Date(item.endsAt as string).getTime() }))
    .filter(({ time }) => Number.isFinite(time) && time > Date.now())
    .sort((a, b) => a.time - b.time);

  const actions: DashboardAction[] = [];
  if (!latestKyc || !["verified", "auto_verified"].includes(latestKyc.status)) {
    actions.push({
      title: "KYC needs attention",
      body: "Complete or update compliance verification before starting paid strategy access.",
      href: "/kyc",
      tone: "clay"
    });
  }

  const latestRebalance = dashboardStrategies
    .filter((item) => item.latestRebalance)
    .sort((a, b) => new Date(b.latestRebalance?.date ?? 0).getTime() - new Date(a.latestRebalance?.date ?? 0).getTime())[0];

  if (latestRebalance) {
    actions.push({
      title: "Latest rebalance ready for review",
      body: `${latestRebalance.strategy.name} published ${formatDashboardDate(latestRebalance.latestRebalance?.date)}. Execution remains client-directed.`,
      href: "/dashboard/rebalances",
      tone: "gold"
    });
  }

  if (expiringAccess[0] && expiringAccess[0].time - Date.now() < 1000 * 60 * 60 * 24 * 30) {
    actions.push({
      title: "Subscription renewal approaching",
      body: `${expiringAccess[0].item.strategy.name} access is currently scheduled to end on ${formatDashboardDate(expiringAccess[0].item.endsAt)}.`,
      href: "/dashboard/account",
      tone: "pine"
    });
  }

  const documents = dashboardStrategies.flatMap((item) => {
    const docs: DashboardDocument[] = [
      {
        title: `${item.strategy.name} research page`,
        description: "Methodology, risks, suitability, and backtest context.",
        href: item.strategyPath,
        strategySlug: item.strategy.slug,
        strategyName: item.strategy.name,
        kind: "strategy"
      }
    ];

    if (item.strategy.exports?.latestModelPortfolioCsv) {
      docs.push({
        title: "Latest model portfolio CSV",
        description: "Current target weights for the published model portfolio.",
        href: item.strategy.exports.latestModelPortfolioCsv,
        strategySlug: item.strategy.slug,
        strategyName: item.strategy.name,
        kind: "portfolio"
      });
    }

    if (item.strategy.exports?.rebalanceHistoryCsv) {
      docs.push({
        title: "Rebalance history CSV",
        description: "Published change log for model portfolio updates.",
        href: item.strategy.exports.rebalanceHistoryCsv,
        strategySlug: item.strategy.slug,
        strategyName: item.strategy.name,
        kind: "rebalance"
      });
    }

    return docs;
  });

  return {
    user,
    firstName: getFirstName(email, fullName),
    email,
    profileRole,
    kycStatus: latestKyc?.status ?? null,
    kycVerifiedAt: latestKyc?.verified_at ?? null,
    strategies: dashboardStrategies,
    actions: actions.slice(0, 3),
    documents,
    subscriptions,
    grants,
    payments,
    nearestRenewal: expiringAccess[0]?.item.endsAt ?? null
  };
}
