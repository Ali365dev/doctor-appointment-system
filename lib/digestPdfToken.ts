import "server-only";
import crypto from "crypto";

const TOKEN_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET environment variable.");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Signed, expiring token so the digest email's PDF link works without an active login session. */
export function createDigestPdfToken(date: string): string {
  const expiresAt = Date.now() + TOKEN_VALIDITY_MS;
  const payload = `${date}.${expiresAt}`;
  return `${expiresAt}.${sign(payload)}`;
}

export function verifyDigestPdfToken(date: string, token: string): boolean {
  const [expiresAtStr, signature] = token.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || !signature || Date.now() > expiresAt) return false;

  const expected = sign(`${date}.${expiresAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
