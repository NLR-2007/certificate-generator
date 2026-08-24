import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  const db = getRepository();
  try {
    const { searchParams } = new URL(req.url);
    const certIdParam = searchParams.get("certificateId");

    if (!certIdParam) {
      return NextResponse.json(
        { found: false, error: "Certificate ID parameter required." },
        { status: 400 }
      );
    }

    const cert = await db.getCertificateById(certIdParam);

    if (!cert) {
      return NextResponse.json({ found: false });
    }

    // Never expose internal phone, email, or private keys!
    return NextResponse.json({
      found: true,
      certificate: {
        certificate_id: cert.certificate_id,
        participant_name: cert.participant_name,
        registration_id: cert.registration_id,
        event_name: cert.event_name,
        issue_date: cert.issue_date,
        status: cert.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ found: false, error: "Server verification error." }, { status: 500 });
  }
}
