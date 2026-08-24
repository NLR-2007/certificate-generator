import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guard";
import { mockDb } from "@/lib/db/mock-store";

const RevokeSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID required").max(64),
  status: z.enum(["VALID", "REVOKED"]),
});

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const validation = RevokeSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: "A certificate ID and a status of VALID or REVOKED are required." },
        { status: 400 }
      );
    }

    const { certificateId, status } = validation.data;

    if (!mockDb.updateCertificateStatus(certificateId, status)) {
      return NextResponse.json({ error: "Certificate record not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificateId: mockDb.findCertificateById(certificateId)!.certificate_id,
      status,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update certificate status." }, { status: 500 });
  }
}
