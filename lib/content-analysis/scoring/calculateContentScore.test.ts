import { describe, expect, it } from "vitest";
import { calculateContentScore } from "./calculateContentScore";
import { buildTestArticle } from "../testFixtures";

const GOOD_BODY = [
  "# مقدمه",
  "",
  "این مقدمه‌ای کاملاً معنادار و به‌اندازه کافی طولانی درباره موضوع اصلی مقاله است که خواننده را با موضوع آشنا می‌کند.",
  "",
  "## بخش میانی",
  "",
  Array.from({ length: 80 }, (_, i) => `کلمه${i}`).join(" "),
  "",
  "## جمع‌بندی",
  "",
  "این یک جمع‌بندی کاملاً معنادار و به‌اندازه کافی طولانی است که موضوع مقاله را به‌خوبی جمع‌بندی می‌کند.",
].join("\n");

describe("calculateContentScore — no longer penalized by legacy fields", () => {
  it("scores a well-structured, sufficiently long article well even though importantPoints/finalQuestion (legacy fields) are always empty", () => {
    const article = buildTestArticle({
      body: GOOD_BODY,
      wordCount: 700,
      importantPoints: [],
      finalQuestion: null,
      imageAltTexts: [],
      headingCount: 2,
    });
    const result = calculateContentScore(article);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it("scores very low for an article with no body at all", () => {
    const result = calculateContentScore(buildTestArticle({ body: null, wordCount: 0 }));
    expect(result.score).toBeLessThanOrEqual(20);
  });
});
