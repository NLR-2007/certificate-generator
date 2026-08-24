"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, signInWithCustomToken } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

/**
 * Browser-side Firebase, used only by the admin dashboard for realtime
 * listeners. Public pages never touch Firestore directly - security rules deny
 * them, and field-level filtering (hiding verification tokens) is only possible
 * server-side, so public reads go through the API routes.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseClientConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId
);

const APP_NAME = "sih-certificate-web";

function getClientApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured) return null;
  const existing = getApps().find((a) => a.name === APP_NAME);
  return existing ?? initializeApp(config as Required<typeof config>, APP_NAME);
}

export function getClientFirestore(): Firestore | null {
  const app = getClientApp();
  return app ? getFirestore(app) : null;
}

export function getClientAuth(): Auth | null {
  const app = getClientApp();
  return app ? getAuth(app) : null;
}

/** Exchanges the custom token minted by /api/admin/session for a signed-in user. */
export async function signInAdmin(customToken: string): Promise<boolean> {
  const auth = getClientAuth();
  if (!auth) return false;
  await signInWithCustomToken(auth, customToken);
  return true;
}
