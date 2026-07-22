import { describe, expect, it } from "vitest";
import { analyzeVoiceSearchReadiness } from "./voiceSearchReadinessAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeVoiceSearchReadiness", () => {
  it("scores 100 with an excerpt, a concise FAQ answer, and hasFaq true", () => {
    const article = buildTestArticle({
      excerpt: "خلاصه کوتاه",
      hasFaq: true,
      faq: [{ question: "اضطراب کودک چیست؟", answer: "پاسخ کوتاه و مستقیم." }],
    });
    expect(analyzeVoiceSearchReadiness(article).score).toBe(100);
  });

  it("suggests an excerpt when missing", () => {
    const result = analyzeVoiceSearchReadiness(buildTestArticle({ excerpt: null }));
    expect(result.suggestions.some((s) => s.includes("خلاصه"))).toBe(true);
  });

  it("suggests FAQ when hasFaq is false", () => {
    const result = analyzeVoiceSearchReadiness(buildTestArticle({ hasFaq: false, faq: [] }));
    expect(result.suggestions.some((s) => s.includes("FAQ"))).toBe(true);
  });

  it("reuses detectFeaturedSnippetCandidates rather than re-deriving answer text", () => {
    const longAnswer = Array.from({ length: 100 }, (_, i) => `کلمه${i}`).join(" ");
    const article = buildTestArticle({
      excerpt: "خلاصه",
      hasFaq: true,
      faq: [{ question: "سوال؟", answer: longAnswer }],
    });
    const result = analyzeVoiceSearchReadiness(article);
    expect(result.suggestions.some((s) => s.includes("پاسخ کوتاه"))).toBe(true);
  });
});
