import { describe, expect, it } from "vitest";
import { findDuplicateTitles, findDuplicateMetaDescriptions, findDuplicateSlugs } from "./findDuplicateFields";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";

describe("findDuplicateTitles", () => {
  it("groups articles that share the exact same title", () => {
    const articles = [
      buildTestArticle({ slug: "a", title: "اضطراب کودکان" }),
      buildTestArticle({ slug: "b", title: "اضطراب کودکان" }),
      buildTestArticle({ slug: "c", title: "موضوع دیگر" }),
    ];
    expect(findDuplicateTitles(articles)).toEqual([{ value: "اضطراب کودکان", slugs: ["a", "b"] }]);
  });

  it("returns an empty array when no titles repeat", () => {
    const articles = [buildTestArticle({ slug: "a", title: "یک" }), buildTestArticle({ slug: "b", title: "دو" })];
    expect(findDuplicateTitles(articles)).toEqual([]);
  });

  it("ignores articles with a null title or null slug", () => {
    const articles = [
      buildTestArticle({ slug: "a", title: null }),
      buildTestArticle({ slug: null, title: "عنوان" }),
    ];
    expect(findDuplicateTitles(articles)).toEqual([]);
  });
});

describe("findDuplicateMetaDescriptions", () => {
  it("groups articles that share the exact same meta description", () => {
    const articles = [
      buildTestArticle({ slug: "a", metaDescription: "توضیحات مشترک" }),
      buildTestArticle({ slug: "b", metaDescription: "توضیحات مشترک" }),
    ];
    expect(findDuplicateMetaDescriptions(articles)).toEqual([{ value: "توضیحات مشترک", slugs: ["a", "b"] }]);
  });
});

describe("findDuplicateSlugs", () => {
  it("groups articles that share the exact same slug (a real, if rare, data bug)", () => {
    const articles = [buildTestArticle({ slug: "same" }), buildTestArticle({ slug: "same" })];
    expect(findDuplicateSlugs(articles)).toEqual([{ value: "same", slugs: ["same", "same"] }]);
  });
});
