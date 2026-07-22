import { describe, expect, it } from "vitest";
import {
  foldPersianText,
  normalizeImportText,
  normalizePersianText,
  stripDiacritics,
} from "./textNormalize";
import { normalizePersian } from "./persianSearch";

describe("stripDiacritics / normalizePersianText diacritics removal", () => {
  it("removes fatha, kasra, damma, tanwin, shadda and sukun", () => {
    // بَسیار with fatha on ب, and مُدَرِّس with shadda/kasra/damma
    expect(stripDiacritics("بَسیار")).toBe("بسیار");
    expect(stripDiacritics("مُدَرِّس")).toBe("مدرس");
    expect(normalizePersianText("سَلاٰم")).toBe("سلام");
  });

  it("leaves plain Persian text untouched", () => {
    expect(stripDiacritics("سلام دنیا")).toBe("سلام دنیا");
  });
});

describe("ZWNJ handling", () => {
  it("preserves a single ZWNJ in display-safe normalization (correct typography)", () => {
    const input = "می‌شود";
    expect(normalizePersianText(input)).toBe("می‌شود");
    expect(normalizePersianText(input)).toContain("‌");
  });

  it("collapses duplicate ZWNJs to one in display-safe normalization", () => {
    const input = "می‌‌‌شود";
    expect(normalizePersianText(input)).toBe("می‌شود");
  });

  it("folds ZWNJ to a plain space in the lossy comparison fold", () => {
    expect(foldPersianText("می‌شود")).toBe("می شود");
    expect(foldPersianText("می‌شود")).not.toContain("‌");
  });
});

describe("Arabic to Persian glyph conversion", () => {
  it("converts Arabic Yeh (ي) to Persian Yeh (ی)", () => {
    expect(normalizePersianText("علي")).toBe("علی");
    expect(foldPersianText("علي")).toBe("علی");
  });

  it("converts Arabic Kaf (ك) to Persian Kaf (ک)", () => {
    expect(normalizePersianText("كتاب")).toBe("کتاب");
  });

  it("persianSearch.normalizePersian still folds Arabic forms (thin wrapper over the shared library)", () => {
    expect(normalizePersian("علي")).toBe("علی");
  });
});

describe("digit normalization (foldPersianText only)", () => {
  it("folds Persian digits to ASCII", () => {
    expect(foldPersianText("۸ دقیقه")).toBe("8 دقیقه");
  });

  it("folds Arabic-Indic digits to ASCII", () => {
    expect(foldPersianText("٨ دقیقه")).toBe("8 دقیقه");
  });

  it("leaves ASCII digits unchanged", () => {
    expect(foldPersianText("1234567890")).toBe("1234567890");
  });

  it("treats Persian, Arabic-Indic and ASCII digit forms of the same value as equal", () => {
    expect(foldPersianText("۸ دقیقه")).toBe(foldPersianText("8 دقیقه"));
    expect(foldPersianText("8 دقیقه")).toBe(foldPersianText("٨ دقیقه"));
    expect(foldPersianText("۱۴۰۴")).toBe(foldPersianText("1404"));
  });

  it("does NOT fold digits in display-safe normalizePersianText", () => {
    expect(normalizePersianText("۸ دقیقه")).toBe("۸ دقیقه");
    expect(normalizePersianText("٨ دقیقه")).toBe("٨ دقیقه");
  });

  it("makes keyword matching work regardless of digit script", () => {
    const body = foldPersianText("زمان مطالعه ۸ دقیقه است");
    expect(body.includes(foldPersianText("8 دقیقه"))).toBe(true);
    expect(body.includes(foldPersianText("٨ دقیقه"))).toBe(true);
  });
});

describe("whitespace normalization", () => {
  it("collapses multiple spaces and trims", () => {
    expect(normalizePersianText("  سلام   دنیا  ")).toBe("سلام دنیا");
  });

  it("normalizes CRLF to LF", () => {
    expect(normalizePersianText("خط اول\r\nخط دوم")).toBe("خط اول\nخط دوم");
  });
});

describe("normalizeImportText (pre-parse normalization)", () => {
  it("normalizes CRLF and trailing spaces per line while preserving blank lines", () => {
    const raw = "Title: تست  \r\nSlug: test\r\n\r\n# عنوان\r\nمتن كتاب با يک اشتباه   تايپي";
    const result = normalizeImportText(raw);
    expect(result).not.toContain("\r");
    expect(result).toContain("Title: تست\n");
    expect(result).toContain("\n\n");
    expect(result).toContain("متن کتاب با یک اشتباه تایپی");
  });

  it("does not alter content inside fenced code blocks", () => {
    const raw = "متن  عادی\n```\nconst  x   =   1;\n```\nمتن   بعدی";
    const result = normalizeImportText(raw);
    expect(result).toContain("const  x   =   1;");
    expect(result).toContain("متن عادی");
    expect(result).toContain("متن بعدی");
  });

  it("leaves URLs untouched since they contain no Persian/Arabic characters", () => {
    const raw = "منبع: https://example.com/path?query=value";
    expect(normalizeImportText(raw)).toContain("https://example.com/path?query=value");
  });
});
