import { describe, expect, it } from "vitest";
import { mapSanityDocumentToArticle, type SanityArticleDocument } from "./fromSanity";
import { DEFAULT_ARTICLE_AUTHOR } from "../constants";

function buildDoc(overrides: Partial<SanityArticleDocument> = {}): SanityArticleDocument {
  return {
    title: "عنوان",
    slug: { current: "test-slug" },
    topic: null,
    category: null,
    readingTime: 3,
    excerpt: "خلاصه",
    callout: null,
    bodyText: "متن مقاله",
    window: null,
    importantPoints: [],
    finalThought: null,
    finalQuestion: null,
    featuredImage: null,
    featuredImageAlt: null,
    sources: [],
    tags: [],
    author: null,
    faq: [],
    status: "published",
    seo: null,
    ...overrides,
  };
}

describe("mapSanityDocumentToArticle — author/canonical/schema consistency", () => {
  it("falls back to the central default author when the Sanity document has no author reference", () => {
    const article = mapSanityDocumentToArticle(buildDoc({ author: null }));
    expect(article.authorName).toBe(DEFAULT_ARTICLE_AUTHOR);
  });

  it("uses the real author name when present", () => {
    const article = mapSanityDocumentToArticle(buildDoc({ author: { name: "نویسنده واقعی" } }));
    expect(article.authorName).toBe("نویسنده واقعی");
  });

  it("computes canonicalUrl via the single shared helper regardless of Sanity seo.canonicalUrl", () => {
    const article = mapSanityDocumentToArticle(
      buildDoc({ slug: { current: "my-slug" }, seo: { metaDescription: null, keywords: null, canonicalUrl: null, ogImage: null, twitterTitle: null } })
    );
    expect(article.canonicalUrl).toBe("https://mirora.ir/journal/my-slug");
  });

  it("hasSchema is always true for a mapped Sanity document — the live page unconditionally emits Article JSON-LD", () => {
    expect(mapSanityDocumentToArticle(buildDoc()).hasSchema).toBe(true);
  });

  it("hasOpenGraph/hasTwitterCard are true from title+excerpt alone, without requiring ogImage/twitterTitle overrides", () => {
    const article = mapSanityDocumentToArticle(
      buildDoc({ title: "عنوان", excerpt: "خلاصه", seo: { metaDescription: null, keywords: null, canonicalUrl: null, ogImage: null, twitterTitle: null } })
    );
    expect(article.hasOpenGraph).toBe(true);
    expect(article.hasTwitterCard).toBe(true);
  });

  it("uses the real Sanity seo.metaDescription unchanged when present", () => {
    const article = mapSanityDocumentToArticle(
      buildDoc({ seo: { metaDescription: "توضیحات واقعی", keywords: null, canonicalUrl: null, ogImage: null, twitterTitle: null } })
    );
    expect(article.metaDescription).toBe("توضیحات واقعی");
  });

  it("auto-generates a Meta Description from bodyText for already-published articles that never had one — same generator the import pipeline uses", () => {
    const bodyText = "# مقدمه\n\nاین یک مقاله واقعی درباره سلامت روان کودکان است که پیش‌تر بدون توضیحات متا منتشر شده بود.";
    const article = mapSanityDocumentToArticle(buildDoc({ bodyText, seo: null }));
    expect(article.metaDescription).not.toBeNull();
    expect(article.metaDescription).toContain("این یک مقاله واقعی درباره سلامت روان کودکان است");
  });
});
