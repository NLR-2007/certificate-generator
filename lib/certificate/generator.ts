import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { randomInt } from "crypto";
import fs from "fs";
import path from "path";
import { calculateFontSizeForName, getCenteredX } from "./fonts";
import { generateVerificationQRCode } from "./qr";
import { sanitizeForPdfText, UnrenderableNameError } from "./text";

export interface GenerateOptions {
  participantName: string;
  registrationId: string;
  certificateId: string;
  issueDate?: string;
  baseUrl?: string;
  customCoordinates?: {
    nameY?: number;
    nameFontSize?: number;
    qrX?: number;
    qrY?: number;
    qrSize?: number;
  };
}

export async function generateCertificatePDF(options: GenerateOptions): Promise<Buffer> {
  const {
    participantName,
    registrationId,
    certificateId,
    issueDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    customCoordinates,
  } = options;

  // 1. Load official template PDF from public/templates/SIH-participation-template.pdf
  const templatePath = path.join(process.cwd(), "public", "templates", "SIH-participation-template.pdf");
  
  let pdfDoc: PDFDocument;
  if (fs.existsSync(templatePath)) {
    const templateBytes = fs.readFileSync(templatePath);
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    // Fallback: Create blank landscape document if template missing
    pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
  }

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // 2. Embed Standard Fonts (Helvetica-Bold for Name, Helvetica for IDs & Labels)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3. Dynamic Font Sizing for Participant Name
  // Position centered right above the underline line on SIH-participation-template.pdf (underline is at ~244pt)
  const nameY = customCoordinates?.nameY ?? 253; 
  const maxFontSize = customCoordinates?.nameFontSize ?? 32;
  const maxWidth = width * 0.65; // Max bounding width for name

  // Standard PDF fonts are WinAnsi-encoded; drawing an unencodable glyph throws.
  const { text: safeName, unsupported } = sanitizeForPdfText(participantName);
  if (unsupported.length > 0) {
    throw new UnrenderableNameError(unsupported);
  }
  if (!safeName) {
    throw new UnrenderableNameError([]);
  }

  // Names are printed in capitals on the official certificate. Uppercasing before
  // measuring matters: capitals are wider, so the fit must be computed on the
  // string that actually gets drawn.
  const displayName = safeName.toUpperCase();

  const fontSize = calculateFontSizeForName(displayName, fontBold, maxWidth, maxFontSize, 18);
  const textWidth = fontBold.widthOfTextAtSize(displayName, fontSize);
  const nameX = getCenteredX(width / 2, textWidth, 24);

  // Draw Centered Participant Name in Deep Slate Navy
  page.drawText(displayName, {
    x: nameX,
    y: nameY,
    size: fontSize,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16), // #0F172A
  });

  // 4. Generate & Embed Verification QR Code
  const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(certificateId)}`;
  const qrBuffer = await generateVerificationQRCode(verificationUrl);
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  const qrSize = customCoordinates?.qrSize ?? 46;
  const qrX = customCoordinates?.qrX ?? 40; 
  const qrY = customCoordinates?.qrY ?? 28;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // 5. Draw Certificate ID & Issue Date neatly beside QR Code (stopping before signature line at X=165)
  const detailsX = qrX + qrSize + 8; // X = 94
  const detailsY = qrY + qrSize - 10; // Y = 64

  page.drawText(`Certificate ID: ${certificateId}`, {
    x: detailsX,
    y: detailsY,
    size: 7.5,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54), // Dark blue
  });

  page.drawText(`Issued: ${issueDate}`, {
    x: detailsX,
    y: detailsY - 11,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.35, 0.42, 0.52),
  });

  // 6. Save modified PDF to Uint8Array/Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generates a cryptographically secure random certificate ID (e.g., SIH26-8F3K92).
 * Certificate IDs are public identifiers, so they must not be guessable from
 * Math.random()'s predictable PRNG state.
 */
export function generateCertificateId(prefix: string = "SIH26"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous O, 0, I, 1
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars[randomInt(chars.length)];
  }
  return `${prefix}-${randomPart}`;
}
