import { NextRequest, NextResponse } from "next/server";
import { parseAndValidateCSV, generateRejectedRowsCSV } from "@/lib/admin/csv";
import { requireAdmin } from "@/lib/admin/guard";
import { mockDb, Participant } from "@/lib/db/mock-store";

const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    if (file.size > MAX_CSV_BYTES) {
      return NextResponse.json(
        { error: "CSV file is too large. The limit is 5 MB." },
        { status: 413 }
      );
    }

    const result = parseAndValidateCSV(await file.text());

    let createdCount = 0;
    let updatedCount = 0;
    const now = new Date().toISOString();

    result.validRows.forEach((row) => {
      const existing = mockDb.findParticipantByRegId(row.registration_id);

      if (existing) {
        // Persist the merged record back into the store rather than mutating a copy.
        mockDb.upsertParticipant({
          ...existing,
          name: row.name,
          email: row.email || existing.email,
          department: row.department || existing.department,
          college: row.college || existing.college,
          event_name: row.event_name || existing.event_name,
          eligible: row.eligible,
          updated_at: now,
        });
        updatedCount++;
      } else {
        const newParticipant: Participant = {
          id: `p-${row.registration_id.trim()}`,
          registration_id: row.registration_id.trim(),
          name: row.name,
          email: row.email,
          department: row.department || "CSE",
          college: row.college || "Koneru Lakshmaiah Education Foundation, Bachupally",
          event_name: row.event_name,
          eligible: row.eligible,
          certificate_generated: false,
          created_at: now,
          updated_at: now,
        };
        mockDb.upsertParticipant(newParticipant);
        createdCount++;
      }
    });

    const rejectedCsv =
      result.invalidRows.length > 0 ? generateRejectedRowsCSV(result.invalidRows) : null;

    return NextResponse.json({
      success: true,
      totalRows: result.totalRows,
      importedCount: createdCount + updatedCount,
      createdCount,
      updatedCount,
      rejectedCount: result.invalidRows.length,
      rejectedCsv,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process CSV upload." }, { status: 500 });
  }
}
