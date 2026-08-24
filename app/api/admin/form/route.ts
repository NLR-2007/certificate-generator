export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { FormConfig } from "@/lib/db/mock-store";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const db = getRepository();
  try {
    const config = await db.getFormConfig();
    const submissions = await db.getFormSubmissions();
    return NextResponse.json({ success: true, config, submissions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load form settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getRepository();
  try {
    const body = await req.json();
    if (!body.title || !Array.isArray(body.fields)) {
      return NextResponse.json({ error: "Invalid form configuration format." }, { status: 400 });
    }

    const updated = await db.updateFormConfig(body as FormConfig);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save form settings." }, { status: 500 });
  }
}
