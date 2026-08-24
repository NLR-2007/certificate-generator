import {
  App,
  cert,
  getApp,
  getApps,
  initializeApp,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

const APP_NAME = "sih-certificate-admin";

/**
 * Server-side Firebase access.
 *
 * Credentials come from a service account. The private key is stored in the
 * environment with literal "\n" sequences (env vars cannot hold real newlines),
 * so they are expanded before use.
 *
 * Everything is lazy and optional: when the env vars are absent the helpers
 * return null and the app transparently falls back to the in-memory store.
 */
function readServiceAccount(): ServiceAccount | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) return null;

  return {
    projectId,
    clientEmail,
    privateKey: rawKey.replace(/\n/g, "\n"),
  };
}

let cachedApp: App | null | undefined;

export function getAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    cachedApp = null;
    return cachedApp;
  }

  const existing = getApps().find((a) => a.name === APP_NAME);
  cachedApp = existing ?? initializeApp({ credential: cert(serviceAccount) }, APP_NAME);
  return cachedApp;
}

let cachedDb: Firestore | null | undefined;

export function getAdminFirestore(): Firestore | null {
  if (cachedDb !== undefined) return cachedDb;

  const app = getAdminApp();
  if (!app) {
    cachedDb = null;
    return cachedDb;
  }

  const db = getFirestore(app);
  // Treat missing optional properties as absent rather than throwing on write.
  db.settings({ ignoreUndefinedProperties: true });
  cachedDb = db;
  return cachedDb;
}

/** True when Firestore credentials are configured on this server. */
export function isFirestoreConfigured(): boolean {
  return getAdminFirestore() !== null;
}

/**
 * Mints a short-lived Firebase custom token carrying an `admin` claim.
 *
 * The dashboard signs in with it so its realtime listeners are authorised by
 * security rules. Our own admin session (an HMAC cookie) is what actually
 * authenticates the operator - this token only grants Firestore read access.
 */
export async function createAdminCustomToken(uid = "klh-admin"): Promise<string | null> {
  const app = getAdminApp();
  if (!app) return null;
  return getAuth(app).createCustomToken(uid, { admin: true });
}
