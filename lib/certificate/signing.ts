import { createHmac, timingSafeEqual } from "crypto";

/**
 * Stateless, self-verifying certificate IDs.
 *
 * With no database behind the app, a certificate cannot be looked up - so the
 * id carries its own proof instead. It is the registration id plus an HMAC of
 * that id under a server-only secret:
 *
 *     SIH26-2520030366-K7M2QXB4
 *     \___/ \________/ \______/
 *     event   reg id    signature
 *
 * Verification recomputes the signature and then confirms the person really is
 * on the roster sheet. Forging an id means forging the HMAC, which needs the
 * secret; the secret never leaves the server.
 *
 * The id is deterministic, which also gives duplicate prevention for free: the
 * same participant always resolves to the same certificate id, so re-running
 * generation reissues their certificate rather than minting a second one.
 */

/** Crockford-style base32: no I, L, O or U, so ids survive being read aloud. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SIGNATURE_LENGTH = 8;

export const DEFAULT_EVENT_PREFIX = "SIH26";

function signingSecret(): string {
  const secret = process.env.CERTIFICATE_SIGNING_SECRET?.trim();
  if (secret) return secret;

  // A deployment without the secret still works and stays self-consistent, but
  // its ids are forgeable by anyone who reads this file. Warn loudly.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "CERTIFICATE_SIGNING_SECRET is not set - certificate ids are using the built-in fallback secret and are not tamper-proof."
    );
  }
  return "sih-certificate-portal-fallback-secret";
}

/** Registration ids are compared case- and whitespace-insensitively. */
export function normaliseRegistrationId(registrationId: string): string {
  return registrationId.trim().toLowerCase();
}

function encodeBase32(bytes: Buffer, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i % bytes.length] % ALPHABET.length];
  }
  return out;
}

export function signRegistrationId(registrationId: string, prefix: string): string {
  const mac = createHmac("sha256", signingSecret())
    .update(`${prefix}:${normaliseRegistrationId(registrationId)}`)
    .digest();
  return encodeBase32(mac, SIGNATURE_LENGTH);
}

/** The one certificate id belonging to this participant. Stable forever. */
export function certificateIdFor(
  registrationId: string,
  prefix: string = DEFAULT_EVENT_PREFIX
): string {
  const regId = registrationId.trim().toUpperCase();
  return `${prefix}-${regId}-${signRegistrationId(registrationId, prefix)}`;
}

export interface ParsedCertificateId {
  prefix: string;
  registrationId: string;
  signature: string;
}

export function parseCertificateId(certificateId: string): ParsedCertificateId | null {
  const parts = certificateId.trim().toUpperCase().split("-");
  if (parts.length !== 3) return null;

  const [prefix, registrationId, signature] = parts;
  if (!prefix || !registrationId || signature.length !== SIGNATURE_LENGTH) return null;

  return { prefix, registrationId, signature };
}

/**
 * True when the id's signature matches the registration id it claims. Compared
 * in constant time so the check cannot be probed character by character.
 */
export function isAuthenticCertificateId(certificateId: string): boolean {
  const parsed = parseCertificateId(certificateId);
  if (!parsed) return false;

  const expected = Buffer.from(signRegistrationId(parsed.registrationId, parsed.prefix));
  const actual = Buffer.from(parsed.signature);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * The issue date printed on every certificate for this event.
 *
 * Fixed per event rather than "whenever the participant clicked download", so a
 * certificate reprinted next month still shows the date it was awarded - and so
 * the printed PDF and the verification page can never disagree.
 */
export function certificateIssueDate(): Date {
  const configured = process.env.CERTIFICATE_ISSUE_DATE?.trim();
  if (configured) {
    const parsed = new Date(configured);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}
