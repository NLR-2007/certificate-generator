/**
 * Admin session handling.
 *
 * The admin passphrase lives only on the server (ADMIN_SECRET_KEY). A successful
 * login mints an HMAC-signed, time-limited session token that is stored in an
 * httpOnly cookie, so the secret itself never reaches the browser and the cookie
 * cannot be forged from the client.
 *
 * Web Crypto is used (rather than node:crypto) so the same helpers work in both
 * the Node.js route-handler runtime and the Edge middleware runtime.
 */

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  return secret && secret.trim().length > 0 ? secret : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/** Constant-time string comparison, to avoid leaking the secret via timing. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Verifies a submitted passphrase against ADMIN_SECRET_KEY. */
export function isValidAdminPassphrase(passphrase: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  return timingSafeEqual(passphrase, secret);
}

/** Mints a signed session token of the form `<expiresAt>.<signature>`. */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, secret)}`;
}

/** Verifies a session token's signature and expiry. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return timingSafeEqual(signature, await sign(payload, secret));
}

/** True when the request carries a valid admin session cookie. */
export async function isAuthenticatedAdmin(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!match) return false;
  return verifySessionToken(decodeURIComponent(match.slice(ADMIN_COOKIE_NAME.length + 1)));
}

/** True when the server has no ADMIN_SECRET_KEY configured at all. */
export function isAdminAuthConfigured(): boolean {
  return getSecret() !== null;
}
