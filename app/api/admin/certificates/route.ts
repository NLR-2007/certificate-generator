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
    return NextResponse.json({ certificates: await db.getAllCertificates() });
  } catch (error) {
    console.error("Admin certificates listing failed:", error);
    return NextResponse.json({ error: "Could not load certificates." }, { status: 500 });
  }
}
