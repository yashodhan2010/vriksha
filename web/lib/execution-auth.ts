import crypto from "node:crypto";
import { getCurrentUser } from "./access";
import { getInternalStrategySlug } from "./data";
import { hasActiveSubscriptionForStrategy, type ExecutionSubscriptionRow } from "./execution-exports";
import { createSupabaseAdminClient } from "./supabase/admin";
import { createSupabaseServerClient } from "./supabase/server";

export const executionTokenTtlHours = 12;
export const executionScopes = {
  subscriptions: "execution:subscriptions:read",
  latestModelPortfolio: "execution:latest-model-portfolio:read",
  rebalanceHistory: "execution:rebalance-history:read"
} as const;

export type ExecutionScope = typeof executionScopes[keyof typeof executionScopes];

type ExecutionTokenRow = {
  user_id: string;
  scopes: string[];
  expires_at: string;
  revoked_at: string | null;
};

export async function getExecutionUser() {
  const user = await getCurrentUser();
  if (!user) return null;

  return user;
}

export async function getActiveExecutionSubscriptionRows(userId: string) {
  const supabase = createSupabaseAdminClient() ?? await createSupabaseServerClient();
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

function hashExecutionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateExecutionTokenValue() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getExecutionTokenExpiry(now = Date.now()) {
  return new Date(now + executionTokenTtlHours * 60 * 60 * 1000);
}

export async function createExecutionApiToken(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Execution token storage is not configured.");
  }

  const token = generateExecutionTokenValue();
  const expiresAt = getExecutionTokenExpiry();
  const scopes = Object.values(executionScopes);

  const { error } = await supabase.from("execution_api_tokens").insert({
    user_id: userId,
    token_hash: hashExecutionToken(token),
    scopes,
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }

  return { token, expiresAt };
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function getExecutionBearerUserId(request: Request, requiredScope: ExecutionScope) {
  const token = getBearerToken(request);
  if (!token) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const tokenHash = hashExecutionToken(token);
  const { data } = await supabase
    .from("execution_api_tokens")
    .select("user_id, scopes, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const row = data as ExecutionTokenRow | null;
  if (!row || row.revoked_at) return null;
  if (!row.scopes.includes(requiredScope)) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  await supabase
    .from("execution_api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return row.user_id;
}

export async function getExecutionAuthorizedUserId(request: Request, requiredScope: ExecutionScope) {
  const bearerUserId = await getExecutionBearerUserId(request, requiredScope);
  if (bearerUserId) return bearerUserId;

  const user = await getExecutionUser();
  return user?.id ?? null;
}
