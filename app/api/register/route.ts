import { NextRequest, NextResponse } from "next/server";
import { mockDb, Participant } from "@/lib/db/mock-store";

export async function GET() {
  try {
    const config = mockDb.getFormConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load hackathon form." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data || {};

    // Validate required fields based on active form config
    const config = mockDb.getFormConfig();
    for (const field of config.fields) {
      if (field.required && (!data[field.id] || String(data[field.id]).trim() === "")) {
        return NextResponse.json(
          { error: `Field "${field.label}" is required.` },
          { status: 400 }
        );
      }
    }

    // Save form submission in mockDb
    const submission = mockDb.saveFormSubmission(data);

    // If registration_id and name are present, also add to participants table so admin can generate certificates!
    const regId = data["registration_id"] || data["rollId"] || data["reg_id"];
    const name = data["name"] || data["full_name"] || data["participant_name"];
    const teamName = data["team_name"] || "Hackathon Team";
    const dept = data["department"] || "CSE";

    if (regId && name) {
      const p: Participant = {
        id: `p-${regId}`,
        registration_id: String(regId).trim(),
        name: String(name).trim(),
        email: data["email"] || "",
        phone: data["phone"] || "",
        department: String(dept),
        college: "Koneru Lakshmaiah Education Foundation, Bachupally",
        event_name: config.title,
        team_name: String(teamName),
        eligible: true,
        certificate_generated: false,
      };
      mockDb.upsertParticipant(p);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: "Registration submitted successfully!",
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error during registration." }, { status: 500 });
  }
}
