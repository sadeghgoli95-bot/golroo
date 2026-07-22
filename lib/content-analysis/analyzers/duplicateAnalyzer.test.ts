import { describe, expect, it } from "vitest";
import { analyzeDuplicateContent } from "./duplicateAnalyzer";
import type { AnalyzableArticle, LinkableArticleSummary } from "../types";

function baseArticle(overrides: Partial<AnalyzableArticle>): AnalyzableArticle {
  return {
    slug: "new-article",
    title: "عنوان",
    topic: null,
    category: null,
    focusKeyword: null,
    secondaryKeywords: [],
    keywords: [],
    tags: [],
    entities: [],
    clusterId: null,
    parentTopic: null,
    body: null,
    excerpt: null,
    headings: [],
    faq: [],
    callout: null,
    window: null,
    importantPoints: [],
    finalThought: null,
    finalQuestion: null,
    metaDescription: null,
    canonicalUrl: null,
    readingTime: null,
    authorName: null,
    sources: [],
    headingCount: 0,
    internalLinkCount: 0,
    externalLinkCount: 0,
    imageAltTexts: [],
    hasFeaturedImage: false,
    hasSchema: false,
    hasCanonical: false,
    hasFaq: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    isPublished: false,
    wordCount: 0,
    characterCount: 0,
    estimatedReadingTime: 0,
    warnings: [],
    ...overrides,
  };
}

function candidate(overrides: Partial<LinkableArticleSummary>): LinkableArticleSummary {
  return {
    slug: "existing-article",
    title: "عنوان",
    topic: null,
    keywords: [],
    entities: [],
    tags: [],
    parentTopic: null,
    clusterId: null,
    isPublished: true,
    body: null,
    ...overrides,
  };
}

describe("duplicate title detection after normalization", () => {
  it("detects a title-only duplicate when the two titles differ by Arabic/Persian glyph variants", () => {
    // Arabic Yeh (ي) vs Persian Yeh (ی) — same word, different codepoints.
    const article = baseArticle({ title: "افسردگی كودكان" });
    const existing = candidate({ title: "افسردگي کودکان" });

    const matches = analyzeDuplicateContent(article, [existing]);
    expect(matches.some((m) => m.matchType === "title" && m.confidence === 100)).toBe(true);
  });

  it("detects a title-only duplicate when one title has stray diacritics the other lacks", () => {
    const article = baseArticle({ title: "اضطراب کودکان" });
    const existing = candidate({ title: "اِضطِراب کودکان" });

    const matches = analyzeDuplicateContent(article, [existing]);
    expect(matches.some((m) => m.matchType === "title" && m.confidence === 100)).toBe(true);
  });

  it("does not flag genuinely different titles as duplicates", () => {
    const article = baseArticle({ title: "اضطراب کودکان" });
    const existing = candidate({ title: "افسردگی نوجوانان" });

    const matches = analyzeDuplicateContent(article, [existing]);
    expect(matches.some((m) => m.matchType === "title")).toBe(false);
  });
});

describe("duplicate body detection after normalization", () => {
  it("still detects near-duplicate bodies when they differ only by ZWNJ/diacritics/glyph variants", () => {
    const body = "این یک متن آزمایشی نسبتاً طولانی درباره سلامت روان کودکان و نوجوانان است که تکرار می‌شود";
    const article = baseArticle({ slug: "a", body });
    // Same content, Arabic Yeh instead of Persian Yeh, ZWNJ replaced with a space.
    const variant = body.replace(/ی/g, "ي").replace(/‌/g, " ");
    const existing = candidate({ slug: "b", body: variant });

    const matches = analyzeDuplicateContent(article, [existing]);
    expect(matches.some((m) => m.matchType === "exact" || m.matchType === "near")).toBe(true);
  });
});
