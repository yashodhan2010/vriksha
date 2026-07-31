import crypto from "crypto";
import { createSupabaseAdminClient } from "./supabase/admin";

export const kycStorageBucket = "kyc-documents";

export const kycVersions = {
  privacyPolicy: "v1",
  terms: "v1",
  mitc: "v1",
  consent: "v1"
};

export const kycAcceptedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export const kycMaxFileBytes = 10 * 1024 * 1024;

export const verifiedKycStatuses = ["auto_verified", "verified"] as const;

export type KycStatus =
  | "not_started"
  | "submitted"
  | "queued_for_validation"
  | "ocr_processing"
  | "auto_verified"
  | "manual_review_required"
  | "verified"
  | "rejected"
  | "needs_resubmission"
  | "expired";

export type KycClientType = "individual" | "huf" | "non_individual" | "accredited_investor";

export type KycDocumentType = "pan" | "address_proof" | "photo" | "signature" | "other";

export function normalizePan(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidPan(value: string) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizePan(value));
}

export function maskPan(value: string) {
  const normalized = normalizePan(value);
  return normalized.slice(-4);
}

export function hashSensitiveValue(value: string) {
  const pepper = process.env.KYC_HASH_PEPPER ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "local-kyc-pepper";
  return crypto.createHmac("sha256", pepper).update(value.trim().toUpperCase()).digest("hex");
}

export function normalizePincode(value: string) {
  return value.trim().replace(/\D/g, "");
}

export function isVerifiedKycStatus(status: string | null | undefined) {
  return verifiedKycStatuses.includes(status as (typeof verifiedKycStatuses)[number]);
}

export async function getLatestKycProfileForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("kyc_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getVerifiedKycProfileForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("kyc_profiles")
    .select("*")
    .eq("user_id", userId)
    .in("status", [...verifiedKycStatuses])
    .order("verified_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function hasVerifiedKyc(userId: string) {
  return Boolean(await getVerifiedKycProfileForUser(userId));
}

