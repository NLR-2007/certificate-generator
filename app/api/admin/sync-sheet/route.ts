import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { getRepository } from "@/lib/db/repository";
import { Participant } from "@/lib/db/mock-store";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  const db = getRepository();
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const body = await req.json().catch(() => ({}));
    const config = await db.getFormConfig();
    const sheetUrl = body.sheetUrl || config.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1eZeQ_X89nSR_fma6eSbVaOuyXaZ8-ffO1KAaWoXFyCU/edit?usp=sharing";

    // Extract spreadsheet ID
    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      return NextResponse.json({ error: "Invalid Google Sheet URL format." }, { status: 400 });
    }

    const spreadsheetId = match[1];
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

    const response = await fetch(csvExportUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not fetch Google Sheet CSV. Make sure the Google Sheet sharing permission is set to 'Anyone with the link can view'." },
        { status: 400 }
      );
    }

    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json({ success: true, importedCount: 0, message: "Google Sheet is empty." });
    }

    let importedCount = 0;
    const now = new Date().toISOString();

    for (const row of parsed.data) {
      // Find registration ID and Name by inspecting common header column names
      const regId =
        row["registration_id"] ||
        row["Registration ID"] ||
        row["Leader Roll ID"] ||
        row["Roll ID"] ||
        row["Roll Number"] ||
        row["Reg ID"] ||
        row["ID"];

      const name =
        row["name"] ||
        row["Name"] ||
        row["Leader Name"] ||
        row["Full Name"] ||
        row["Participant Name"];

      if (!regId || !name) continue;

      const cleanedRegId = String(regId).trim();
      const cleanedName = String(name).trim();
      const teamName = row["team_name"] || row["Team Name"] || row["Team"] || "Hackathon Team";
      const dept = row["department"] || row["Department"] || "CSE";

      // Upsert Leader
      await db.upsertParticipant({
        id: `p-${cleanedRegId}`,
        registration_id: cleanedRegId,
        name: cleanedName,
        email: row["email"] || row["Email"] || "",
        phone: row["phone"] || row["Phone"] || "",
        department: String(dept),
        college: "Koneru Lakshmaiah Education Foundation, Bachupally",
        event_name: config.title || "Smart India Hackathon 2026",
        team_name: String(teamName),
        eligible: true,
        certificate_generated: false,
        updated_at: now,
      });
      importedCount++;

      // Check for additional members if present in Google Sheet columns
      for (let i = 2; i <= 10; i++) {
        const mName = row[`Member ${i} Name`] || row[`member_${i}_name`];
        const mId = row[`Member ${i} Roll ID`] || row[`member_${i}_id`] || row[`Member ${i} ID`];
        if (mName && mId) {
          const cMId = String(mId).trim();
          const cMName = String(mName).trim();
          await db.upsertParticipant({
            id: `p-${cMId}`,
            registration_id: cMId,
            name: cMName,
            email: "",
            phone: "",
            department: String(dept),
            college: "Koneru Lakshmaiah Education Foundation, Bachupally",
            event_name: config.title || "Smart India Hackathon 2026",
            team_name: String(teamName),
            eligible: true,
            certificate_generated: false,
            updated_at: now,
          });
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully synced ${importedCount} participants from connected Google Sheet.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to sync with Google Sheet." }, { status: 500 });
  }
}
