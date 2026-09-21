import crypto from "crypto";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.KYC_FIELD_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("KYC_FIELD_ENCRYPTION_KEY is required for KRA validation mode.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptKycPayload(payload: Record<string, unknown>) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    alg: "AES-256-GCM",
    iv: iv.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    tag: tag.toString("base64")
  };
}

export function getKycValidationMode() {
  return process.env.KYC_VALIDATION_MODE === "kra" ? "kra" : "ocr";
}
