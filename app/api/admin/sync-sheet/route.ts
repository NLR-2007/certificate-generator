export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { SheetUnavailableError, fetchSheetRows, invalidateSheetCache } from "@/lib/sheet/client";
import { mapRowsToParticipants } from "@/lib/sheet/participants";
import { getRepository } from "@/lib/db/repository";

/**
 * Re-reads the roster sheet.
 *
 * There is nothing to import into any more - the sheet *is* the database, read
 * live on every lookup. This drops the cached rows and reports what the sheet
 * currently holds, so an admin can confirm an edit landed.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getRepository();
    const body = await req.json().catch(() => ({}));
    const config = await db.getFormConfig();
    const sheetUrl: string | undefined = body.sheetUrl || config.googleSheetUrl;

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "No roster sheet is configured. Add its URL in Form Settings." },
        { status: 400 }
      );
    }

    invalidateSheetCache(sheetUrl);
    const rows = await fetchSheetRows(sheetUrl, { force: true });
    const participants = mapRowsToParticipants(rows, {
      eventName: config.title || "Smart India Hackathon 2026",
    });

    const eligible = participants.filter((p) => p.eligible && !p.revoked).length;

    return NextResponse.json({
      success: true,
      rowCount: rows.length,
      importedCount: participants.length,
      eligibleCount: eligible,
      message: `Read ${participants.length} participants (${eligible} eligible) from ${rows.length} sheet rows.`,
    });
  } catch (error) {
    if (error instanceof SheetUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Sheet refresh failed:", error);
    return NextResponse.json({ error: "Failed to read the Google Sheet." }, { status: 500 });
  }
}
