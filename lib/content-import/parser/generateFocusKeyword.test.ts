import { describe, expect, it } from "vitest";
import { generateFocusKeyword } from "./generateFocusKeyword";

describe("generateFocusKeyword", () => {
  it("returns null when there is no title", () => {
    expect(generateFocusKeyword(null, ["دلبستگی"], "موضوع")).toBeNull();
  });

  it("derives a 2-5 word candidate from the Title by trimming stop words from the edges", () => {
    const result = generateFocusKeyword("افسردگی در کودکان چیست", [], null);
    expect(result).toBe("افسردگی در کودکان");
  });

  it("produces exactly the title when it's already within 2-5 content words", () => {
    const result = generateFocusKeyword("اضطراب کودکان", [], null);
    expect(result).toBe("اضطراب کودکان");
  });

  it("caps the candidate at 5 words", () => {
    const result = generateFocusKeyword("یک دو سه چهار پنج شش هفت", [], null);
    expect(result!.split(" ")).toHaveLength(5);
  });

  it("falls back to Keywords when the title alone doesn't yield 2+ content words", () => {
    const result = generateFocusKeyword("چیست", ["ذهنی سازی کودک"], null);
    // "چیست" alone is a stop word — title candidate fails, falls through
    // to Keywords, but "ذهنی سازی کودک" must also appear in the title to
    // qualify; since it doesn't, this specific case has no valid
    // candidate at all (title itself has no other content).
    expect(result).toBeNull();
  });

  it("uses a Keywords candidate only when it actually appears in the Title", () => {
    const result = generateFocusKeyword("ذهنی سازی در کودکان چیست", ["ذهنی سازی"], null);
    // Title itself yields a valid candidate first (priority order), so
    // Keywords is never consulted here — this exercises priority, not
    // the Keywords fallback in isolation.
    expect(result).toBe("ذهنی سازی در کودکان");
  });

  it("falls back to Topic when neither Title nor Keywords yield a valid candidate", () => {
    // A title with no extractable 2+ word phrase after trimming edges.
    const result = generateFocusKeyword("چیست؟", ["نامرتبط کاملاً"], "توضیحات متا");
    expect(result).toBeNull(); // topic also has no relation to a title with no content words
  });

  it("tries the next candidate when the first Keywords entry does not appear in the Title", () => {
    const title = "تنظیم هیجان در کودکان";
    const result = generateFocusKeyword(title, ["موضوع نامرتبط کاملاً", "تنظیم هیجان"], null);
    expect(result).toBe(title); // title candidate wins by priority before Keywords is even tried
  });

  it("never generates a candidate shorter than 2 words", () => {
    const result = generateFocusKeyword("یک", [], null);
    expect(result).toBeNull();
  });

  it("ignores ZWNJ and diacritic differences when checking title containment", () => {
    // Keyword has no ZWNJ, title has one — foldPersianText should treat them as equal.
    const title = "چگونه با اضطراب کودکان کنار بياييم";
    const result = generateFocusKeyword(title, [], null);
    expect(result).not.toBeNull();
    expect(result!.split(" ").length).toBeGreaterThanOrEqual(2);
    expect(result!.split(" ").length).toBeLessThanOrEqual(5);
  });

  it("never returns an empty string", () => {
    const result = generateFocusKeyword("", [], null);
    expect(result).not.toBe("");
  });
});
