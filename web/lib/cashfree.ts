import { Cashfree, CFEnvironment } from "cashfree-pg";

export const cashfreeScriptUrl = "https://sdk.cashfree.com/js/v3/cashfree.js";

export type CashfreeMode = "sandbox" | "production";

export function getCashfreeMode(): CashfreeMode {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

export function getPublicCashfreeMode(): CashfreeMode {
  return process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : getCashfreeMode();
}

export function createCashfreeClient() {
  const clientId = process.env.CASHFREE_CLIENT_ID ?? process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET ?? process.env.CASHFREE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    return null;
  }

  const environment = getCashfreeMode() === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new Cashfree(environment, clientId, clientSecret);
}

export function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getCashfreeCustomerPhone(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const digits = value?.replace(/\D/g, "");
    if (digits && digits.length >= 10) {
      return digits.slice(-10);
    }
  }

  return null;
}
