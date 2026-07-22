import { describe, expect, it } from "vitest";
import { buildRssItem, buildAtomEntry } from "./buildFeedItem";
import type { FeedArticle } from "./getFeedArticles";

function buildArticle(overrides: Partial<FeedArticle> = {}): FeedArticle {
  return {
    title: "عنوان مقاله",
    slug: "test-slug",
    excerpt: "خلاصه مقاله",
    publishedAt: "2026-01-01T00:00:00.000Z",
    lastUpdated: null,
    authorName: null,
    categoryTitle: "روان‌شناسی کودک",
    ...overrides,
  };
}

describe("buildRssItem", () => {
  it("builds a well-formed item with the canonical URL and default author fallback", () => {
    const item = buildRssItem(buildArticle());
    expect(item).toContain("<title>عنوان مقاله</title>");
    expect(item).toContain("<link>https://mirora.ir/journal/test-slug</link>");
    expect(item).toContain("صادق گل‌رو"); // default author, since none given
    expect(item).toContain("روان‌شناسی کودک");
  });

  it("escapes special characters in the title", () => {
    const item = buildRssItem(buildArticle({ title: "A & B < C" }))!;
    expect(item).toContain("A &amp; B &lt; C");
  });

  it("returns null when there is no slug", () => {
    expect(buildRssItem(buildArticle({ slug: "" }))).toBeNull();
  });

  it("returns null when there is no title", () => {
    expect(buildRssItem(buildArticle({ title: null }))).toBeNull();
  });
});

describe("buildAtomEntry", () => {
  it("builds a well-formed entry with an ISO updated date", () => {
    const entry = buildAtomEntry(buildArticle())!;
    expect(entry).toContain("<id>https://mirora.ir/journal/test-slug</id>");
    expect(entry).toContain("<updated>2026-01-01T00:00:00.000Z</updated>");
  });

  it("uses lastUpdated over publishedAt for the updated date when both exist", () => {
    const entry = buildAtomEntry(buildArticle({ lastUpdated: "2026-06-01T00:00:00.000Z" }))!;
    expect(entry).toContain("<updated>2026-06-01T00:00:00.000Z</updated>");
  });

  it("returns null when there is no slug or title", () => {
    expect(buildAtomEntry(buildArticle({ slug: "" }))).toBeNull();
    expect(buildAtomEntry(buildArticle({ title: null }))).toBeNull();
  });
});
