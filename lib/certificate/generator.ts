import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { calculateFontSizeForName, getCenteredX } from "./fonts";
import { CERTIFICATE_LAYOUT, fitTextSize, layoutCertificateIdCaption } from "./layout";
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

export function getBaseUrl(req?: any): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (req && typeof req.headers?.get === "function") {
    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://certificategeneratornlr.vercel.app";
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
    baseUrl = getBaseUrl(),
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
  const nameLayout = CERTIFICATE_LAYOUT.name;
  const nameY = customCoordinates?.nameY ?? nameLayout.y;
  const maxFontSize = customCoordinates?.nameFontSize ?? nameLayout.maxFontSize;
  const maxWidth = width * nameLayout.maxWidthRatio;

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

  const fontSize = calculateFontSizeForName(
    displayName,
    fontBold,
    maxWidth,
    maxFontSize,
    nameLayout.minFontSize
  );
  const textWidth = fontBold.widthOfTextAtSize(displayName, fontSize);
  const nameX = getCenteredX(width / 2, textWidth, nameLayout.minX);

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

  const qrSize = customCoordinates?.qrSize ?? CERTIFICATE_LAYOUT.qrCode.size;
  const qrX = customCoordinates?.qrX ?? CERTIFICATE_LAYOUT.qrCode.x;
  const qrY = customCoordinates?.qrY ?? CERTIFICATE_LAYOUT.qrCode.y;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // 5. Certificate ID and issue date, stacked under the QR code.
  //
  // They sit below the QR rather than beside it so they have the whole left
  // margin to run into. Beside it there are only ~70pt before the signature
  // block, which a full certificate ID has not fitted in since IDs started
  // carrying the registration number.
  const caption = CERTIFICATE_LAYOUT.caption;
  const captionX = customCoordinates?.qrX ?? caption.x;
  const idCaption = layoutCertificateIdCaption(certificateId, fontBold, caption);

  let captionY = caption.y;
  for (const line of idCaption.lines) {
    page.drawText(line, {
      x: captionX,
      y: captionY,
      size: idCaption.size,
      font: fontBold,
      color: rgb(0.12, 0.23, 0.54), // Dark blue
    });
    captionY -= caption.lineGap;
  }

  const issuedText = `Issued: ${issueDate}`;
  page.drawText(issuedText, {
    x: captionX,
    y: captionY,
    size: fitTextSize(issuedText, fontRegular, caption.maxWidth, idCaption.size, caption.minFontSize),
    font: fontRegular,
    color: rgb(0.35, 0.42, 0.52),
  });

  // 6. Save modified PDF to Uint8Array/Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

