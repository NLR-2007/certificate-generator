export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const db = getRepository();
  const denied = await requireAdmin(req);
  if (denied) return denied;

  return NextResponse.json({ certificates: await db.getAllCertificates() });
}
