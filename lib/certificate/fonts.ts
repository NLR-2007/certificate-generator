import { PDFFont } from "pdf-lib";

/**
 * Calculates optimal font size for a name string so it never overflows the maximum allowed width on the PDF.
 *
 * The size is stepped down until the measured width fits. If the name still does
 * not fit at `minFontSize`, `minFontSize` is returned — callers should treat that
 * as "clamp the X position" rather than assume it fits.
 */
export function calculateFontSizeForName(
  name: string,
  font: PDFFont,
  maxWidthPoints: number = 550,
  maxFontSize: number = 36,
  minFontSize: number = 18
): number {
  // Guard against a min above max (e.g. a small custom nameFontSize from the admin UI).
  const floor = Math.min(minFontSize, maxFontSize);
  let fontSize = maxFontSize;

  // Fallback initial tier based on character length, never above the caller's max.
  if (name.length > 40) {
    fontSize = Math.min(fontSize, 22);
  } else if (name.length > 30) {
    fontSize = Math.min(fontSize, 26);
  } else if (name.length > 20) {
    fontSize = Math.min(fontSize, 30);
  }
  fontSize = Math.max(fontSize, floor);

  // Precise measurement scaling loop.
  while (fontSize > floor) {
    if (font.widthOfTextAtSize(name, fontSize) <= maxWidthPoints) {
      break;
    }
    fontSize -= 1;
  }

  return fontSize;
}

/**
 * Calculates the centered X coordinate given a text width and target center X.
 * The result is clamped to `minX` so an over-long name is never drawn off-page.
 */
export function getCenteredX(centerX: number, textWidth: number, minX: number = 0): number {
  return Math.max(minX, centerX - textWidth / 2);
}
