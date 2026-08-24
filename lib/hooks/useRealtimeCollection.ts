"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, QueryConstraint } from "firebase/firestore";
import { getClientFirestore, isFirebaseClientConfigured, signInAdmin } from "@/lib/firebase/client";

/**
 * Subscribes the admin dashboard to a Firestore collection in real time.
 *
 * Returns `null` when realtime is unavailable (Firebase not configured, or no
 * admin token), which tells the caller to keep using its fetched data. That way
 * the dashboard works identically on the in-memory backend, just without live
 * updates.
 *
 * Note on cost: Firestore bills the initial snapshot plus each changed document,
 * so `constraints` should carry a limit rather than watching an entire roster.
 */
export function useRealtimeCollection<T>(
  path: string | null,
  firebaseToken: string | null,
  constraints: QueryConstraint[] = []
): T[] | null {
  const [docs, setDocs] = useState<T[] | null>(null);
  // Constraints are rebuilt on every render; serialise them so the effect does
  // not tear down and re-open the listener each time (which would re-bill the
  // whole initial snapshot).
  const constraintKey = JSON.stringify(
    constraints.map((c) => (c as unknown as { type?: string }).type ?? "c")
  );

  useEffect(() => {
    if (!path || !firebaseToken || !isFirebaseClientConfigured) {
      setDocs(null);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        await signInAdmin(firebaseToken);
        if (cancelled) return;

        const db = getClientFirestore();
        if (!db) return;

        unsubscribe = onSnapshot(
          query(collection(db, path), ...constraints),
          (snap) => {
            if (!cancelled) setDocs(snap.docs.map((d) => d.data() as T));
          },
          () => {
            // Permission or network failure: fall back to fetched data.
            if (!cancelled) setDocs(null);
          }
        );
      } catch {
        if (!cancelled) setDocs(null);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, firebaseToken, constraintKey]);

  return docs;
}
