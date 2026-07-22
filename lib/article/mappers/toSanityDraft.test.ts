import { describe, expect, it } from "vitest";
import { mapArticleToSanityDraft } from "./toSanityDraft";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";

describe("mapArticleToSanityDraft — Portable Text body key completeness", () => {
  it("produces a body where every block, list item, and span has a _key (root cause of the Studio 'Missing keys' warning)", () => {
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      body: "# مقدمه\n\nیک پاراگراف با **پررنگ**.\n\n- آیتم اول\n- آیتم دوم\n\n> نقل‌قول\n\n```js\ncode();\n```",
    });

    const draft = mapArticleToSanityDraft(article);

    expect(draft.body.length).toBeGreaterThan(0);
    for (const item of draft.body) {
      expect(item._key).toBeTruthy();
      if (item._type === "block") {
        expect(item.children.length).toBeGreaterThan(0);
        for (const child of item.children) {
          expect(child._key).toBeTruthy();
        }
      }
    }
  });

  it("produces an empty body array (not a keyless single block) when the article has no body", () => {
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", body: null });
    const draft = mapArticleToSanityDraft(article);
    expect(draft.body).toEqual([]);
  });
});

describe("mapArticleToSanityDraft — schema/importer field sync", () => {
  it("maps readingTime as a plain number field", () => {
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", readingTime: 5 });
    const draft = mapArticleToSanityDraft(article);
    expect(draft.readingTime).toBe(5);
  });

  it("omits readingTime when the article has none, rather than sending null", () => {
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", readingTime: null });
    const draft = mapArticleToSanityDraft(article);
    expect(draft).not.toHaveProperty("readingTime");
  });

  it("maps focusKeyword under seo, not as a top-level field (matches sanity/schemaTypes/seo.ts)", () => {
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", focusKeyword: "اضطراب کودکان" });
    const draft = mapArticleToSanityDraft(article);
    expect(draft.seo.focusKeyword).toBe("اضطراب کودکان");
    expect(draft).not.toHaveProperty("focusKeyword");
  });

  it("only sets category/tags/faq/sources/author when the corresponding resolved reference is passed in — never fabricates a reference itself", () => {
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      category: "روان‌شناسی کودک",
      tags: ["اضطراب"],
      faq: [{ question: "سوال؟", answer: "پاسخ." }],
      sources: [{ doi: null, pmid: null, url: "https://apa.org", author: null, journal: null, year: null, title: "منبع" }],
    });

    const withoutRefs = mapArticleToSanityDraft(article);
    expect(withoutRefs).not.toHaveProperty("category");
    expect(withoutRefs).not.toHaveProperty("tags");
    expect(withoutRefs).not.toHaveProperty("faq");
    expect(withoutRefs).not.toHaveProperty("sources");
    expect(withoutRefs).not.toHaveProperty("author");

    const withRefs = mapArticleToSanityDraft(article, {
      category: { _type: "reference", _ref: "cat-1" },
      tags: [{ _type: "reference", _ref: "tag-1" }],
      faq: [{ _type: "reference", _ref: "faq-1" }],
      sources: [{ _type: "reference", _ref: "src-1" }],
      author: { _type: "reference", _ref: "author-1" },
    });
    expect(withRefs.category).toEqual({ _type: "reference", _ref: "cat-1" });
    expect(withRefs.tags).toEqual([{ _type: "reference", _ref: "tag-1" }]);
    expect(withRefs.faq).toEqual([{ _type: "reference", _ref: "faq-1" }]);
    expect(withRefs.sources).toEqual([{ _type: "reference", _ref: "src-1" }]);
    expect(withRefs.author).toEqual({ _type: "reference", _ref: "author-1" });
  });
});
