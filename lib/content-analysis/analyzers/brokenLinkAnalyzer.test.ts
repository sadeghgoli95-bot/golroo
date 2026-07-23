import { describe, expect, it } from "vitest";
import { extractLinkUrls, findBrokenInternalLinks, extractExternalLinkUrls } from "./brokenLinkAnalyzer";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";

describe("extractLinkUrls", () => {
  it("extracts every Markdown link target", () => {
    const body = "متن با [لینک اول](/journal/a) و [لینک دوم](https://who.int/x).";
    expect(extractLinkUrls(body)).toEqual(["/journal/a", "https://who.int/x"]);
  });

  it("returns an empty array for null body", () => {
    expect(extractLinkUrls(null)).toEqual([]);
  });
});

describe("findBrokenInternalLinks", () => {
  it("flags an internal /journal/ link whose slug doesn't exist", () => {
    const article = buildTestArticle({ body: "بیشتر بخوانید: [مقاله مرتبط](/journal/missing-slug)" });
    const broken = findBrokenInternalLinks(article, new Set(["existing-slug"]));
    expect(broken).toEqual([{ url: "/journal/missing-slug", targetSlug: "missing-slug" }]);
  });

  it("does not flag an internal link whose slug exists", () => {
    const article = buildTestArticle({ body: "بیشتر بخوانید: [مقاله مرتبط](/journal/existing-slug)" });
    const broken = findBrokenInternalLinks(article, new Set(["existing-slug"]));
    expect(broken).toEqual([]);
  });

  it("resolves an absolute mirora.ir/journal/ URL the same as a relative one", () => {
    const article = buildTestArticle({ body: "[لینک](https://mirora.ir/journal/missing-slug)" });
    const broken = findBrokenInternalLinks(article, new Set());
    expect(broken).toEqual([{ url: "https://mirora.ir/journal/missing-slug", targetSlug: "missing-slug" }]);
  });

  it("ignores external links entirely", () => {
    const article = buildTestArticle({ body: "[منبع خارجی](https://who.int/reference)" });
    expect(findBrokenInternalLinks(article, new Set())).toEqual([]);
  });
});

describe("extractExternalLinkUrls", () => {
  it("returns only external http(s) links, excluding internal /journal/ links", () => {
    const body = "[داخلی](/journal/a) و [خارجی](https://who.int/x)";
    expect(extractExternalLinkUrls(body)).toEqual(["https://who.int/x"]);
  });
});
