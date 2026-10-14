import crypto from "node:crypto";

export const dhanBrokerId = "dhan";
const dhanAuthBaseUrl = "https://auth.dhan.co";

type DhanConsentResponse = {
  consentId?: string;
};

type DhanConsumeResponse = {
  dhanClientId?: string;
  dhanClientName?: string;
  dhanClientUcc?: string;
  accessToken?: string;
  expiryTime?: string;
  givenPowerOfAttorney?: boolean;
};

function getDhanPartnerCredentials() {
  const partnerId = process.env.DHAN_PARTNER_ID;
  const partnerSecret = process.env.DHAN_PARTNER_SECRET;
  return partnerId && partnerSecret ? { partnerId, partnerSecret } : null;
}

export function getDhanCallbackUrl(appUrl: string) {
  return `${appUrl}/api/brokers/dhan/callback`;
}

export function getDhanPostbackUrl(appUrl: string) {
  const secret = process.env.DHAN_POSTBACK_SECRET;
  if (!secret) return null;
  return `${appUrl}/api/brokers/dhan/postback?key=${encodeURIComponent(secret)}`;
}

export async function createDhanConsent() {
  const credentials = getDhanPartnerCredentials();
  if (!credentials) throw new Error("Dhan partner credentials are not configured.");

  const response = await fetch(`${dhanAuthBaseUrl}/partner/generate-consent`, {
    headers: {
      partner_id: credentials.partnerId,
      partner_secret: credentials.partnerSecret
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({})) as DhanConsentResponse;

  if (!response.ok || !payload.consentId) {
    throw new Error("Dhan could not start a consent session.");
  }

  return payload.consentId;
}

export function getDhanConsentLoginUrl(consentId: string) {
  return `${dhanAuthBaseUrl}/consent-login?consentId=${encodeURIComponent(consentId)}`;
}

export async function consumeDhanConsent(tokenId: string) {
  const credentials = getDhanPartnerCredentials();
  if (!credentials) throw new Error("Dhan partner credentials are not configured.");

  const response = await fetch(
    `${dhanAuthBaseUrl}/partner/consume-consent?tokenId=${encodeURIComponent(tokenId)}`,
    {
      headers: {
        partner_id: credentials.partnerId,
        partner_secret: credentials.partnerSecret
      },
      cache: "no-store"
    }
  );
  const payload = await response.json().catch(() => ({})) as DhanConsumeResponse;

  if (!response.ok || !payload.dhanClientId || !payload.accessToken || !payload.expiryTime) {
    throw new Error("Dhan could not complete the consent session.");
  }

  const expiry = new Date(payload.expiryTime);
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
    throw new Error("Dhan returned an invalid token expiry.");
  }

  return {
    clientId: payload.dhanClientId,
    clientName: payload.dhanClientName ?? null,
    clientUcc: payload.dhanClientUcc ?? null,
    accessToken: payload.accessToken,
    expiresAt: expiry,
    givenPowerOfAttorney: payload.givenPowerOfAttorney ?? false
  };
}

function getEncryptionKey() {
  const encoded = process.env.BROKER_TOKEN_ENCRYPTION_KEY;
  if (!encoded) throw new Error("Broker token encryption is not configured.");

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("Broker token encryption key must be 32 bytes, base64 encoded.");
  return key;
}

export function encryptBrokerToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function createBrokerState() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashBrokerState(state: string) {
  return crypto.createHash("sha256").update(state).digest("hex");
}

export function secretsMatch(value: string | null, expected: string | undefined) {
  if (!value || !expected) return false;
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}
