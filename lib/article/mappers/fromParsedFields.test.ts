import { describe, expect, it } from "vitest";
import { mapParsedFieldsToArticle } from "./fromParsedFields";
import { DEFAULT_ARTICLE_AUTHOR } from "../constants";
import type { ParsedArticleFields } from "../types";

function buildParsed(overrides: Partial<ParsedArticleFields> = {}): ParsedArticleFields {
  return {
    title: "عنوان",
    slug: "test-slug",
    topic: null,
    category: null,
    focusKeyword: null,
    secondaryKeywords: [],
    keywords: [],
    tags: [],
    metaDescription: null,
    readingTime: 1,
    excerpt: null,
    body: null,
    headings: [],
    faq: [],
    sources: [],
    warnings: [],
    wordCount: 0,
    characterCount: 0,
    estimatedReadingTime: 1,
    ...overrides,
  };
}

describe("mapParsedFieldsToArticle", () => {
  it("always sets the default author, regardless of input", () => {
    const article = mapParsedFieldsToArticle(buildParsed());
    expect(article.authorName).toBe(DEFAULT_ARTICLE_AUTHOR);
    expect(article.authorName).toBe("صادق گل‌رو");
  });

  it("computes canonicalUrl from the site URL and slug automatically", () => {
    const article = mapParsedFieldsToArticle(buildParsed({ slug: "child-anxiety" }));
    expect(article.canonicalUrl).toBe("https://mirora.ir/journal/child-anxiety");
  });

  it("has no canonicalUrl when there is no slug", () => {
    const article = mapParsedFieldsToArticle(buildParsed({ slug: null }));
    expect(article.canonicalUrl).toBeNull();
  });

  it("sets hasOpenGraph/hasTwitterCard true when title and a description exist", () => {
    const article = mapParsedFieldsToArticle(buildParsed({ title: "عنوان", metaDescription: "توضیحات" }));
    expect(article.hasOpenGraph).toBe(true);
    expect(article.hasTwitterCard).toBe(true);
  });

  it("sets hasOpenGraph/hasTwitterCard false when there is no title or description at all", () => {
    const article = mapParsedFieldsToArticle(buildParsed({ title: null, metaDescription: null, excerpt: null }));
    expect(article.hasOpenGraph).toBe(false);
    expect(article.hasTwitterCard).toBe(false);
  });

  it("hasOpenGraph/hasTwitterCard fall back to true via excerpt when metaDescription is missing", () => {
    const article = mapParsedFieldsToArticle(buildParsed({ title: "عنوان", metaDescription: null, excerpt: "خلاصه" }));
    expect(article.hasOpenGraph).toBe(true);
  });

  it("hasSchema is always true — the pipeline always generates Article/FAQ JSON-LD", () => {
    expect(mapParsedFieldsToArticle(buildParsed()).hasSchema).toBe(true);
  });
});
