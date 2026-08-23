import { getCurrentUser } from "./access";
import { getInternalStrategySlug } from "./data";
import { hasActiveSubscriptionForStrategy, type ExecutionSubscriptionRow } from "./execution-exports";
import { createSupabaseServerClient } from "./supabase/server";

export async function getExecutionUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  return user;
}

export async function getActiveExecutionSubscriptionRows(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("subscriptions")
    .select("strategy_slug, status, starts_at, ends_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(100);

  return (data ?? []) as ExecutionSubscriptionRow[];
}

export async function hasActiveExecutionSubscription(userId: string, strategyId: string) {
  const internalSlug = getInternalStrategySlug(strategyId);
  const rows = await getActiveExecutionSubscriptionRows(userId);

  return hasActiveSubscriptionForStrategy(rows, internalSlug);
}
