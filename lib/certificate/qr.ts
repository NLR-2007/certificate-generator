import QRCode from "qrcode";

/**
 * Generates a PNG Buffer or Data URL of a QR Code encoding the public verification URL.
 */
export async function generateVerificationQRCode(verificationUrl: string): Promise<Buffer> {
  const pngBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "H",
    type: "png",
    margin: 1,
    width: 250,
    color: {
      dark: "#0F172A", // Dark navy slate
      light: "#FFFFFF",
    },
  });

  return pngBuffer;
}
