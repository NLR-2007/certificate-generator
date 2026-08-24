import { describe, expect, test } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { generateCertificateId } from "../lib/certificate/generator";
import { calculateFontSizeForName, getCenteredX } from "../lib/certificate/fonts";
import { sanitizeForPdfText } from "../lib/certificate/text";
import { parseAndValidateCSV } from "../lib/admin/csv";

describe("Certificate System Core Unit Tests", () => {
  test("generateCertificateId creates unique ID with prefix", () => {
    const certId1 = generateCertificateId("SIH26");
    const certId2 = generateCertificateId("SIH26");

    expect(certId1).toMatch(/^SIH26-[A-Z0-9]{6}$/);
    expect(certId2).toMatch(/^SIH26-[A-Z0-9]{6}$/);
    expect(certId1).not.toEqual(certId2);
  });

  test("generateCertificateId omits visually ambiguous characters", () => {
    const ids = Array.from({ length: 200 }, () => generateCertificateId("SIH26"));
    for (const id of ids) {
      expect(id.slice(6)).not.toMatch(/[O0I1]/);
    }
    // Cryptographic randomness should not repeat across a small sample.
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("calculateFontSizeForName tier scaling logic", () => {
    const mockFont: any = {
      widthOfTextAtSize: (text: string, size: number) => text.length * (size * 0.5),
    };

    const shortNameSize = calculateFontSizeForName("Akhil Reddy", mockFont, 500, 34, 18);
    const longNameSize = calculateFontSizeForName(
      "Venkata Sai Sri Lakshmi Narasimha Reddy",
      mockFont,
      500,
      34,
      18
    );

    expect(shortNameSize).toBeGreaterThan(longNameSize);
    expect(shortNameSize).toBeLessThanOrEqual(34);
    expect(longNameSize).toBeGreaterThanOrEqual(18);
  });

  test("calculateFontSizeForName never exceeds the caller's maximum", () => {
    const mockFont: any = { widthOfTextAtSize: () => 1 };

    // A 25-char name hits the "> 20" tier of 30, which must not raise a max of 12.
    const size = calculateFontSizeForName("Abcdefghij Klmnopqrst Uvwx", mockFont, 500, 12, 18);
    expect(size).toBeLessThanOrEqual(12);
  });

  test("getCenteredX centers text and clamps to the left margin", () => {
    expect(getCenteredX(400, 200)).toBe(300);
    // An over-wide name must not be drawn off the left edge of the page.
    expect(getCenteredX(400, 900, 24)).toBe(24);
  });
});

describe("PDF text sanitization", () => {
  test("strips accents and normalizes typographic punctuation", () => {
    const { text, unsupported } = sanitizeForPdfText("Ramya  Krishná’s");
    expect(text).toBe("Ramya Krishna's");
    expect(unsupported).toEqual([]);
  });

  test("reports characters the standard PDF font cannot encode", () => {
    const { unsupported } = sanitizeForPdfText("प्रिया शर्मा");
    expect(unsupported.length).toBeGreaterThan(0);
  });

  test("sanitized names are actually drawable with a standard PDF font", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([842, 595]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    const { text } = sanitizeForPdfText("José  Anand’s Reddy—Rao");
    page.drawText(text, { x: 50, y: 300, size: 20, font });

    await expect(doc.save()).resolves.toBeInstanceOf(Uint8Array);
  });
});

describe("CSV participant import parsing", () => {
  test("separates valid rows from rows missing required fields", () => {
    const csv = [
      "registration_id,name,email,eligible",
      "2520090002,Marri Hruthika,hruthika@example.com,true",
      ",Missing Reg Id,someone@example.com,true",
      "2520090093,,blank@example.com,false",
    ].join("\n");

    const result = parseAndValidateCSV(csv);

    expect(result.totalRows).toBe(3);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].registration_id).toBe("2520090002");
    expect(result.invalidRows).toHaveLength(2);
  });

  test("coerces the eligible column and defaults the event name", () => {
    const csv = ["registration_id,name,eligible", "2520090002,Marri Hruthika,1"].join("\n");
    const result = parseAndValidateCSV(csv);

    expect(result.validRows[0].eligible).toBe(true);
    expect(result.validRows[0].event_name).toBe("Smart India Hackathon 2026");
  });
});
