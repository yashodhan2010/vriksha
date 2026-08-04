import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";

function hasDemoStrategyAccess(strategySlug: string) {
  return process.env.DEMO_SUBSCRIBED_STRATEGIES?.split(",").map((slug) => slug.trim()).includes(strategySlug) ?? false;
}

function isAdminEmail(email: string | undefined | null) {
  if (!email) return false;
  return process.env.ADMIN_EMAILS
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase()) ?? false;
}

async function hasSupabaseAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.getAll().some((cookie) => /^sb-.+-auth-token/.test(cookie.name));
}

export async function getCurrentUser() {
  if (!(await hasSupabaseAuthCookie())) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function hasStrategyAccess(strategySlug: string) {
  if (hasDemoStrategyAccess(strategySlug)) {
    return true;
  }

  if (!(await hasSupabaseAuthCookie())) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const now = Date.now();
  const isCurrent = (endsAt: string | null) => !endsAt || new Date(endsAt).getTime() > now;

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id, ends_at")
    .eq("user_id", user.id)
    .eq("strategy_slug", strategySlug)
    .in("status", ["trialing", "active"])
    .limit(20);

  if (subscriptions?.some((subscription) => isCurrent(subscription.ends_at))) {
    return true;
  }

  const { data: grants } = await supabase
    .from("strategy_access_grants")
    .select("id, starts_at, ends_at")
    .eq("user_id", user.id)
    .eq("strategy_slug", strategySlug)
    .is("revoked_at", null)
    .limit(20);

  return Boolean(
    grants?.some((grant) => new Date(grant.starts_at).getTime() <= now && isCurrent(grant.ends_at))
  );
}

export async function isAdmin() {
  if (process.env.DEMO_ADMIN === "true") {
    return true;
  }

  if (!(await hasSupabaseAuthCookie())) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  if (isAdminEmail(user.email)) {
    return true;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .in("role", ["admin", "research_analyst", "compliance"])
    .maybeSingle();

  return Boolean(data);
}
