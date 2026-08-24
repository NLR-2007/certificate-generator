import { PDFFont } from "pdf-lib";

/**
 * Where everything the app prints goes on the certificate.
 *
 * Coordinates are PDF points from the bottom-left of the page, measured against
 * the official artwork (842.25 x 595.5). The artwork is a flat image, so these
 * are the only description of its layout that exists - keep them here rather
 * than scattered through the generator.
 *
 * The numbers that matter, measured off the template:
 *
 *   y=105  the signature rule above "Dr. G Kalpana"
 *   y=77   "Dr. G Kalpana"
 *   y=45   "CO-ORDINATOR",        starting at x=215
 *   y=25   "EDC-Cell & IIC KLHB", starting at x=202
 *   y=14   top of the navy footer band
 *
 * So the free area in the bottom-left corner is roughly x 30-200, y 16-100.
 * The QR sits in it and the caption lines run underneath, which is what keeps
 * them clear of the signature block no matter how long a certificate ID gets.
 */
export const CERTIFICATE_LAYOUT = {
  /** Participant name, centred on the page above the ruled line. */
  name: {
    y: 253,
    maxFontSize: 32,
    minFontSize: 18,
    /** Share of the page width the name may occupy. */
    maxWidthRatio: 0.65,
    /** Never draw closer than this to the left edge. */
    minX: 24,
  },

  qrCode: {
    x: 36,
    y: 46,
    size: 44,
  },

  /**
   * Certificate ID and issue date, stacked below the QR code.
   *
   * `maxWidth` stops the caption before the signature block; text is shrunk to
   * fit it rather than allowed to run underneath "CO-ORDINATOR".
   */
  caption: {
    x: 36,
    /** Baseline of the first line. The second sits `lineGap` below it. */
    y: 32,
    lineGap: 10,
    maxWidth: 158,
    maxFontSize: 7,
    minFontSize: 5,
  },
} as const;

/**
 * Largest size at or below `maxSize` that renders `text` within `maxWidth`.
 * Returns `minSize` when even that overflows, so the caller can decide whether
 * to shorten the string instead.
 */
export function fitTextSize(
  text: string,
  font: PDFFont,
  maxWidth: number,
  maxSize: number,
  minSize: number
): number {
  let size = maxSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.25;
  }
  return size;
}

/**
 * Lays out the certificate ID caption.
 *
 * The label is dropped before the ID is: a reader can infer what the string is,
 * but a truncated or overflowing ID is worse than useless. Only if the bare ID
 * still will not fit at the minimum size does the caption wrap onto two lines.
 */
export function layoutCertificateIdCaption(
  certificateId: string,
  font: PDFFont,
  config: { maxWidth: number; maxFontSize: number; minFontSize: number } = CERTIFICATE_LAYOUT.caption
): { lines: string[]; size: number } {
  const { maxWidth, maxFontSize, minFontSize } = config;

  const labelled = `Certificate ID: ${certificateId}`;
  const labelledSize = fitTextSize(labelled, font, maxWidth, maxFontSize, minFontSize);
  if (font.widthOfTextAtSize(labelled, labelledSize) <= maxWidth) {
    return { lines: [labelled], size: labelledSize };
  }

  const bareSize = fitTextSize(certificateId, font, maxWidth, maxFontSize, minFontSize);
  if (font.widthOfTextAtSize(certificateId, bareSize) <= maxWidth) {
    return { lines: [certificateId], size: bareSize };
  }

  return { lines: ["Certificate ID:", certificateId], size: minFontSize };
}
