import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { getRepository, isFirestoreConfigured, seedParticipants } from "@/lib/db/repository";

/**
 * One-time copy of the built-in 289-participant roster into Firestore.
 * Idempotent: records that already exist are skipped, never overwritten.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  if (!isFirestoreConfigured()) {
    return NextResponse.json(
      { error: "Firestore is not configured, so there is nothing to seed into." },
      { status: 400 }
    );
  }

  try {
    const result = await seedParticipants();
    return NextResponse.json({ success: true, backend: getRepository().backend, ...result });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed participants." }, { status: 500 });
  }
}
