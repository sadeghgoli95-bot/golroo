import { describe, expect, it } from "vitest";
import { analyzeIntroConclusion } from "./introConclusionAnalyzer";
import { buildTestArticle } from "../testFixtures";

const STRONG_PARAGRAPH =
  "این یک پاراگراف کاملاً معنادار و طولانی است که به‌راحتی از حداقل تعداد کلمه لازم برای مقدمه و جمع‌بندی هر دو عبور می‌کند و محتوای واقعی و کافی برای این آزمون در خود دارد تا هر دو بررسی را با موفقیت پشت سر بگذارد.";

describe("analyzeIntroConclusion", () => {
  it("scores 0 when there is no body", () => {
    expect(analyzeIntroConclusion(buildTestArticle({ body: null })).score).toBe(0);
  });

  it("scores 100 with a strong introduction and a strong, distinct conclusion", () => {
    const body = `# مقدمه\n\n${STRONG_PARAGRAPH}\n\n## بخش میانی\n\nمتن میانی.\n\n${STRONG_PARAGRAPH}`;
    const result = analyzeIntroConclusion(buildTestArticle({ body }));
    expect(result.score).toBe(100);
  });

  it("flags a weak (too short) introduction", () => {
    const body = `# مقدمه\n\nمقدمه کوتاه.\n\n${STRONG_PARAGRAPH}`;
    const result = analyzeIntroConclusion(buildTestArticle({ body }));
    expect(result.suggestions.some((s) => s.includes("مقدمه"))).toBe(true);
  });

  it("flags a missing conclusion when the body has only one paragraph", () => {
    const body = `# مقدمه\n\n${STRONG_PARAGRAPH}`;
    const result = analyzeIntroConclusion(buildTestArticle({ body }));
    expect(result.suggestions.some((s) => s.includes("جمع‌بندی"))).toBe(true);
  });
});
