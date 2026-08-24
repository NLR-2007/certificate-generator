import { describe, expect, test } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { generateCertificatePDF } from "../lib/certificate/generator";
import {
  certificateIdFor,
  isAuthenticCertificateId,
  parseCertificateId,
} from "../lib/certificate/signing";
import {
  CERTIFICATE_LAYOUT,
  fitTextSize,
  layoutCertificateIdCaption,
} from "../lib/certificate/layout";
import { mapRowsToParticipants } from "../lib/sheet/participants";
import { parseCombinedMembers } from "../lib/sheet/members";
import { calculateFontSizeForName, getCenteredX } from "../lib/certificate/fonts";
import { sanitizeForPdfText } from "../lib/certificate/text";
import { parseAndValidateCSV } from "../lib/admin/csv";

describe("Certificate System Core Unit Tests", () => {
  test("certificateIdFor is deterministic and shaped as expected", () => {
    const first = certificateIdFor("2520030366");
    const second = certificateIdFor(" 2520030366 ");

    expect(first).toMatch(/^SIH26-[A-Z0-9]+-[0-9A-Z]{8}$/);
    // The same participant must always resolve to the same certificate: this is
    // what prevents a second certificate being issued on a repeat request.
    expect(second).toBe(first);
  });

  test("different participants get different certificate IDs", () => {
    const ids = new Set(
      ["2520030366", "2520090002", "2520080010", "2520030151"].map((r) => certificateIdFor(r))
    );
    expect(ids.size).toBe(4);
  });

  test("a genuine certificate ID verifies and a tampered one does not", () => {
    const id = certificateIdFor("2520030366");
    expect(isAuthenticCertificateId(id)).toBe(true);

    const parsed = parseCertificateId(id)!;
    expect(parsed.registrationId).toBe("2520030366");

    // Swapping in someone else"+String.fromCharCode(39)+"s registration id invalidates the signature.
    expect(isAuthenticCertificateId(`SIH26-2520090002-${parsed.signature}`)).toBe(false);
    // So does editing the signature itself.
    expect(isAuthenticCertificateId(`SIH26-2520030366-AAAAAAAA`)).toBe(false);
    // And so does a malformed id.
    expect(isAuthenticCertificateId("SIH26-2520030366")).toBe(false);
    expect(isAuthenticCertificateId("not-a-certificate")).toBe(false);
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

describe("Google Sheet roster mapping", () => {
  const defaults = { eventName: "Smart India Hackathon 2026" };

  test("maps a team row into the leader and every listed member", () => {
    const participants = mapRowsToParticipants(
      [
        {
          "Leader Roll ID": "2520030366",
          "Leader Name": "Lokesh Reddy",
          "Team Name": "InnoTech",
          "Member 2 Roll ID": "2520090002",
          "Member 2 Name": "Marri Hruthika",
          "Member 3 Roll ID": "2520080010",
          "Member 3 Name": "K. Gayathri",
        },
      ],
      defaults
    );

    expect(participants.map((p) => p.registration_id)).toEqual([
      "2520030366",
      "2520090002",
      "2520080010",
    ]);
    expect(participants.every((p) => p.team_name === "InnoTech")).toBe(true);
    expect(participants.every((p) => p.eligible)).toBe(true);
  });

  test("reads headers case- and punctuation-insensitively", () => {
    const [participant] = mapRowsToParticipants(
      [{ "registration id": "2520030366", "full  name": "Lokesh Reddy" }],
      defaults
    );

    expect(participant.registration_id).toBe("2520030366");
    expect(participant.name).toBe("Lokesh Reddy");
  });

  test("honours the eligible and revoked columns", () => {
    const [ineligible] = mapRowsToParticipants(
      [{ "Registration ID": "2520030001", Name: "A Person", Eligible: "FALSE" }],
      defaults
    );
    expect(ineligible.eligible).toBe(false);

    const [revoked] = mapRowsToParticipants(
      [{ "Registration ID": "2520030002", Name: "B Person", Revoked: "TRUE" }],
      defaults
    );
    expect(revoked.eligible).toBe(true);
    expect(revoked.revoked).toBe(true);
  });

  test("skips rows with no registration ID and de-duplicates repeats", () => {
    const participants = mapRowsToParticipants(
      [
        { Name: "Nameless Row" },
        { "Registration ID": "2520030366", Name: "Lokesh Reddy" },
        { "Registration ID": "2520030366", Name: "Lokesh Reddy (resubmitted)" },
      ],
      defaults
    );

    expect(participants).toHaveLength(1);
    // A later row wins, so a corrected resubmission takes effect.
    expect(participants[0].name).toBe("Lokesh Reddy (resubmitted)");
  });
});

describe("Combined team-member cell parsing", () => {
  test("reads dash-separated name and ID pairs", () => {
    expect(
      parseCombinedMembers("Marri Hruthika - 2520090002, K Gayathri - 2520080010")
    ).toEqual([
      { name: "Marri Hruthika", registrationId: "2520090002" },
      { name: "K Gayathri", registrationId: "2520080010" },
    ]);
  });

  test("reads bracketed IDs and newline-separated entries", () => {
    expect(parseCombinedMembers("Marri Hruthika (2520090002)\nK Gayathri (2520080010)")).toEqual([
      { name: "Marri Hruthika", registrationId: "2520090002" },
      { name: "K Gayathri", registrationId: "2520080010" },
    ]);
  });

  test("pairs a name with the ID that follows it on the next entry", () => {
    expect(
      parseCombinedMembers("Marri Hruthika, 2520090002, K Gayathri, 2520080010")
    ).toEqual([
      { name: "Marri Hruthika", registrationId: "2520090002" },
      { name: "K Gayathri", registrationId: "2520080010" },
    ]);
  });

  test("reads entries written ID first", () => {
    expect(parseCombinedMembers("2520090002 Marri Hruthika")).toEqual([
      { name: "Marri Hruthika", registrationId: "2520090002" },
    ]);
  });

  test("drops IDs with no name, and de-duplicates", () => {
    expect(parseCombinedMembers("2520090002")).toEqual([]);
    expect(parseCombinedMembers("")).toEqual([]);
    expect(
      parseCombinedMembers("Marri Hruthika - 2520090002; Marri Hruthika - 2520090002")
    ).toHaveLength(1);
  });

  test("team rows using the combined column produce one participant each", () => {
    const participants = mapRowsToParticipants(
      [
        {
          "Leader Name": "Lokesh Reddy",
          "Leader Roll ID": "2520030366",
          "Team Name": "InnoTech",
          "All Team Member Names & IDs": "Marri Hruthika - 2520090002, K Gayathri - 2520080010",
        },
      ],
      { eventName: "Smart India Hackathon 2026" }
    );

    expect(participants.map((p) => p.registration_id).sort()).toEqual([
      "2520030366",
      "2520080010",
      "2520090002",
    ]);
    expect(participants.every((p) => p.team_name === "InnoTech")).toBe(true);
  });
});

describe("Certificate footer layout", () => {
  /**
   * Measured off the official artwork: the nearest signature-block text
   * ("EDC-Cell & IIC KLHB") starts at x=202pt. The footer caption must stop
   * short of it, or the certificate ID prints on top of the signature.
   */
  const SIGNATURE_BLOCK_LEFT_EDGE = 202;

  const boldFont = async () => {
    const doc = await PDFDocument.create();
    return doc.embedFont(StandardFonts.HelveticaBold);
  };

  test("a full-length certificate ID caption stays clear of the signature block", async () => {
    const font = await boldFont();
    const { caption } = CERTIFICATE_LAYOUT;

    const { lines, size } = layoutCertificateIdCaption(
      certificateIdFor("2520080060"),
      font,
      caption
    );

    const widest = Math.max(...lines.map((l) => font.widthOfTextAtSize(l, size)));
    expect(widest).toBeLessThanOrEqual(caption.maxWidth);
    expect(caption.x + widest).toBeLessThan(SIGNATURE_BLOCK_LEFT_EDGE);
  });

  test("the caption sits below the QR code, not beside it", () => {
    const { qrCode, caption } = CERTIFICATE_LAYOUT;
    // Beside the QR there are only ~70pt before the signature block, which a
    // full certificate ID has never fitted into.
    expect(caption.y).toBeLessThan(qrCode.y);
    expect(caption.x).toBe(qrCode.x);
  });

  test("drops the label before it truncates the ID", async () => {
    const font = await boldFont();
    const id = certificateIdFor("2520080060");

    const tight = layoutCertificateIdCaption(id, font, {
      maxWidth: 90,
      maxFontSize: 7,
      minFontSize: 5,
    });

    expect(tight.lines).toEqual([id]);
  });

  test("wraps rather than overflowing when even the bare ID will not fit", async () => {
    const font = await boldFont();
    const id = certificateIdFor("2520080060");

    const verySmall = layoutCertificateIdCaption(id, font, {
      maxWidth: 30,
      maxFontSize: 7,
      minFontSize: 5,
    });

    expect(verySmall.lines).toEqual(["Certificate ID:", id]);
  });

  test("fitTextSize never returns a size above the requested maximum", async () => {
    const font = await boldFont();
    expect(fitTextSize("x", font, 500, 7, 5)).toBe(7);
    expect(fitTextSize("x".repeat(400), font, 10, 7, 5)).toBe(5);
  });
});
