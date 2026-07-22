import { describe, expect, it } from "vitest";
import { detectFeaturedSnippetCandidates } from "./featuredSnippetAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("detectFeaturedSnippetCandidates", () => {
  it("returns FAQ items as candidates", () => {
    const article = buildTestArticle({
      faq: [{ question: "اضطراب کودک چیست؟", answer: "اضطراب یک واکنش طبیعی روانی است." }],
    });
    const candidates = detectFeaturedSnippetCandidates(article);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].source).toBe("faq");
    expect(candidates[0].question).toBe("اضطراب کودک چیست؟");
  });

  it("extracts the paragraph following a question-format heading in the body", () => {
    const body = ["## افسردگی کودکان چیست؟", "", "افسردگی کودکان یک اختلال خلقی است که در دوران کودکی رخ می‌دهد.", "", "## علائم", "", "برخی علائم وجود دارند."].join("\n");
    const article = buildTestArticle({
      body,
      headings: [
        { level: 2, text: "افسردگی کودکان چیست؟", slug: "a" },
        { level: 2, text: "علائم", slug: "b" },
      ],
    });
    const candidates = detectFeaturedSnippetCandidates(article);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].source).toBe("heading");
    expect(candidates[0].answer).toContain("افسردگی کودکان یک اختلال خلقی است");
  });

  it("ignores non-question headings", () => {
    const body = ["## علائم", "", "متن بعد از تیتر."].join("\n");
    const article = buildTestArticle({ body, headings: [{ level: 2, text: "علائم", slug: "a" }] });
    expect(detectFeaturedSnippetCandidates(article)).toHaveLength(0);
  });

  it("truncates a long answer to the featured-snippet word limit", () => {
    const longAnswer = Array.from({ length: 100 }, (_, i) => `کلمه${i}`).join(" ");
    const article = buildTestArticle({ faq: [{ question: "سوال؟", answer: longAnswer }] });
    const candidates = detectFeaturedSnippetCandidates(article);
    expect(candidates[0].answer.split(/\s+/).length).toBeLessThanOrEqual(59);
    expect(candidates[0].answer.endsWith("…")).toBe(true);
  });

  it("returns no candidates when there is no body and no FAQ", () => {
    const article = buildTestArticle({ body: null, faq: [], headings: [] });
    expect(detectFeaturedSnippetCandidates(article)).toHaveLength(0);
  });
});
