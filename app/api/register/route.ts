import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FORM_CONFIG, Participant } from "@/lib/db/mock-store";
import { getRepository } from "@/lib/db/repository";

export async function GET() {
  const db = getRepository();
  try {
    let config = await db.getFormConfig();
    if (!config || !Array.isArray(config.fields) || config.fields.length === 0) {
      config = DEFAULT_FORM_CONFIG;
    }
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ success: true, config: DEFAULT_FORM_CONFIG });
  }
}

export async function POST(req: NextRequest) {
  const db = getRepository();
  try {
    const body = await req.json();
    const data = body.data || {};

    // Validate required fields based on active form config
    const config = await db.getFormConfig();
    for (const field of config.fields) {
      if (field.required && (!data[field.id] || String(data[field.id]).trim() === "")) {
        return NextResponse.json(
          { error: `Field "${field.label}" is required.` },
          { status: 400 }
        );
      }
    }

    // Save form submission in mockDb
    const submission = await db.saveFormSubmission(data);

    // Upsert Leader into participants database
    const regId = data["registration_id"] || data["rollId"] || data["reg_id"];
    const name = data["name"] || data["full_name"] || data["participant_name"];
    const teamName = data["team_name"] || "Hackathon Team";
    const dept = data["department"] || "CSE";

    if (regId && name) {
      await db.upsertParticipant({
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
      });
    }

    // Upsert all additional Team Members (e.g. member_2_name, member_2_id, member_3_name, member_3_id...)
    const memberCount = parseInt(data["team_member_count"] || "1", 10);
    for (let i = 2; i <= (memberCount || 10); i++) {
      const mName = data[`member_${i}_name`];
      const mId = data[`member_${i}_id`];
      if (mName && mId) {
        await db.upsertParticipant({
          id: `p-${mId}`,
          registration_id: String(mId).trim(),
          name: String(mName).trim(),
          email: "",
          phone: "",
          department: String(dept),
          college: "Koneru Lakshmaiah Education Foundation, Bachupally",
          event_name: config.title,
          team_name: String(teamName),
          eligible: true,
          certificate_generated: false,
        });
      }
    }

    // Construct readable summary of all team members
    const teamMembersSummary: string[] = [`Leader: ${name} (${regId})`];
    for (let i = 2; i <= (memberCount || 10); i++) {
      const mName = data[`member_${i}_name`];
      const mId = data[`member_${i}_id`];
      if (mName && mId) {
        teamMembersSummary.push(`Member ${i}: ${mName} (${mId})`);
      }
    }
    const teamMembersText = teamMembersSummary.join(" | ");

    // Save formatted team members summary into submission data
    data["team_members_summary"] = teamMembersText;

    // Forward response to Google Sheets Webhook if configured
    if (config.googleSheetWebhookUrl) {
      try {
        fetch(config.googleSheetWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: submission.id,
            submittedAt: submission.submitted_at,
            formData: data,
            name,
            registration_id: regId,
            email: data["email"] || "",
            phone: data["phone"] || "",
            department: dept,
            team_name: teamName,
            team_role: data["team_role"] || "",
            team_member_count: memberCount,
            team_members: teamMembersText,
            project_title: data["project_title"] || "",
          }),
        }).catch(() => {});
      } catch (e) {
        // ignore webhook fetch error
      }
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
