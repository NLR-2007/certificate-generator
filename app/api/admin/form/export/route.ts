export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db/repository";

/** A sheet row may carry no timestamp, or one Date cannot parse. */
function formatSubmittedAt(value: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

export async function GET(req: NextRequest) {
  try {
    const db = getRepository();
    const config = await db.getFormConfig();
    const submissions = await db.getFormSubmissions();

    // Headers: Submission ID, Submitted At, followed by all dynamic form field labels
    const headers = ["Submission ID", "Submitted At", ...config.fields.map((f) => f.label)];
    const csvRows: string[] = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",")];

    submissions.forEach((sub) => {
      const row = [
        sub.id,
        formatSubmittedAt(sub.submitted_at),
        ...config.fields.map((f) => sub.data[f.id] || ""),
      ];
      csvRows.push(row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","));
    });

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hackathon_responses_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export responses to CSV." }, { status: 500 });
  }
}
