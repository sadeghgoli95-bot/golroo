import { describe, expect, it } from "vitest";
import { calculateAEOScore } from "./calculateAEOScore";
import { buildTestArticle } from "../testFixtures";

describe("calculateAEOScore (rewritten for the current Markdown import format)", () => {
  it("scores well for a fresh import with FAQ, question headings and a concise answer — despite finalQuestion/importantPoints (legacy fields) always being empty", () => {
    const article = buildTestArticle({
      finalQuestion: null,
      importantPoints: [],
      hasFaq: true,
      faq: [{ question: "اضطراب کودک چیست؟", answer: "اضطراب کودک یک واکنش طبیعی به موقعیت‌های تنش‌زا است." }],
      headings: [{ level: 2, text: "اضطراب کودک چیست؟", slug: "a" }],
    });

    const result = calculateAEOScore(article);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  it("scores 0 for a bare article with no FAQ, no question headings and no body — not because legacy fields are empty (they always are), but because there is genuinely no AEO signal", () => {
    const article = buildTestArticle({ hasFaq: false, faq: [], headings: [], body: null });
    const result = calculateAEOScore(article);
    expect(result.score).toBe(0);
  });
});
