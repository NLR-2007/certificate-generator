import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { mockDb } from "@/lib/db/mock-store";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  // Live view of the store, so CSV imports and issued certificates are reflected.
  return NextResponse.json({ participants: mockDb.getAllParticipants() });
}
