/**
 * pdf-lib's standard fonts (Helvetica) are WinAnsi-encoded, so any character
 * outside that set makes `drawText` throw and the whole request fail with a 500.
 * Names are normalised first (so accented Latin letters survive as plain ASCII)
 * and anything still unrepresentable is reported, letting callers return a clear
 * error instead of an opaque crash.
 */

// Typographic characters that commonly appear in pasted spreadsheet data.
const REPLACEMENTS: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "…": "...",
  " ": " ",
};

/** Characters WinAnsi can encode: Latin-1 plus the CP1252 0x80-0x9F block. */
function isWinAnsiEncodable(char: string): boolean {
  const code = char.codePointAt(0)!;
  if (code === 0x0a || code === 0x0d || code === 0x09) return true;
  if (code < 0x20) return false;
  if (code <= 0xff) return true;
  return "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ".includes(
    char
  );
}

/**
 * Normalises a name for drawing on the certificate.
 * Returns the cleaned text plus any characters that still cannot be rendered.
 */
export function sanitizeForPdfText(input: string): { text: string; unsupported: string[] } {
  const replaced = Array.from(input)
    .map((char) => REPLACEMENTS[char] ?? char)
    .join("");

  // NFKD splits "é" into "e" + combining accent; stripping the marks leaves ASCII.
  const normalized = replaced.normalize("NFKD").replace(/\p{M}+/gu, "");

  const unsupported = Array.from(new Set(Array.from(normalized).filter((c) => !isWinAnsiEncodable(c))));

  return { text: normalized.replace(/\s+/g, " ").trim(), unsupported };
}

/** Thrown when a participant name cannot be rendered with the standard PDF fonts. */
export class UnrenderableNameError extends Error {
  public readonly unsupported: string[];

  constructor(unsupported: string[]) {
    super(
      `This name contains characters the certificate font cannot render: ${unsupported.join(" ")}`
    );
    this.name = "UnrenderableNameError";
    this.unsupported = unsupported;
  }
}
