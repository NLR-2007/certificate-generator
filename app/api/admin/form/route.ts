import { NextRequest, NextResponse } from "next/server";
import { mockDb, FormConfig } from "@/lib/db/mock-store";

export async function GET(req: NextRequest) {
  try {
    const config = mockDb.getFormConfig();
    const submissions = mockDb.getFormSubmissions();
    return NextResponse.json({ success: true, config, submissions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load form settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !Array.isArray(body.fields)) {
      return NextResponse.json({ error: "Invalid form configuration format." }, { status: 400 });
    }

    const updated = mockDb.updateFormConfig(body as FormConfig);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save form settings." }, { status: 500 });
  }
}
