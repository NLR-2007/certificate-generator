import { describe, expect, test } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { generateCertificateId, generateCertificatePDF } from "../lib/certificate/generator";
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

describe("Certificate PDF pipeline", () => {
  test("renders a valid PDF from the official template", async () => {
    const pdf = await generateCertificatePDF({
      participantName: "Marri Hruthika",
      registrationId: "2520090002",
      certificateId: "SIH26-TEST22",
      baseUrl: "https://example.test",
    });

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10000);
  });

  test("prints the participant name in capitals", async () => {
    // Content streams are compressed, so instead of grepping the bytes: if the
    // name is uppercased before drawing, differently-cased input must render to
    // byte-identical PDFs. Every other input is held constant.
    const render = (participantName: string) =>
      generateCertificatePDF({
        participantName,
        registrationId: "2520090002",
        certificateId: "SIH26-TEST23",
        issueDate: "01/01/2026",
        baseUrl: "https://example.test",
      });

    const [lower, mixed, upper] = await Promise.all([
      render("marri hruthika"),
      render("Marri Hruthika"),
      render("MARRI HRUTHIKA"),
    ]);

    expect(lower.equals(upper)).toBe(true);
    expect(mixed.equals(upper)).toBe(true);
  });

  test("rejects a name the certificate font cannot render", async () => {
    await expect(
      generateCertificatePDF({
        participantName: String.fromCodePoint(0x092a, 0x094d, 0x0930),
        registrationId: "X",
        certificateId: "SIH26-TEST24",
      })
    ).rejects.toThrow(/cannot render/i);
  });
});
