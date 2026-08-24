export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getRepository();
    // Live view of the store, so CSV imports and issued certificates are reflected.
    return NextResponse.json({ participants: await db.getAllParticipants() });
  } catch (error) {
    console.error("Admin participants listing failed:", error);
    return NextResponse.json({ error: "Could not load participants." }, { status: 500 });
  }
}
