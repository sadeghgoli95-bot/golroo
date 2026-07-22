import { describe, expect, it } from "vitest";
import { buildMetaTagsPreview } from "./metaTags";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";

describe("buildMetaTagsPreview", () => {
  it("uses metaDescription when present, for both title/description and OG/Twitter", () => {
    const article = buildTestArticle({
      title: "عنوان مقاله",
      metaDescription: "توضیحات متا",
      excerpt: "خلاصه مقاله",
      canonicalUrl: "https://mirora.ir/journal/test",
    });
    const preview = buildMetaTagsPreview(article);

    expect(preview.title).toBe("عنوان مقاله");
    expect(preview.description).toBe("توضیحات متا");
    expect(preview.openGraph.title).toBe("عنوان مقاله");
    expect(preview.openGraph.description).toBe("توضیحات متا");
    expect(preview.openGraph.url).toBe("https://mirora.ir/journal/test");
    expect(preview.twitterCard.title).toBe("عنوان مقاله");
    expect(preview.twitterCard.description).toBe("توضیحات متا");
  });

  it("falls back to the excerpt when metaDescription is missing", () => {
    const article = buildTestArticle({ title: "عنوان", metaDescription: null, excerpt: "خلاصه" });
    const preview = buildMetaTagsPreview(article);
    expect(preview.description).toBe("خلاصه");
  });

  it("always sets robots to index+follow (noindex is a Sanity-only manual override, not an import-time concern)", () => {
    const preview = buildMetaTagsPreview(buildTestArticle({}));
    expect(preview.robots).toEqual({ index: true, follow: true });
  });

  it("uses the summary_large_image Twitter card type", () => {
    const preview = buildMetaTagsPreview(buildTestArticle({}));
    expect(preview.twitterCard.card).toBe("summary_large_image");
  });

  it("never concatenates keywords/reading time/author into the OG/Twitter description — only Meta Description or excerpt", () => {
    const article = buildTestArticle({
      title: "عنوان",
      metaDescription: "این تنها توضیحات متا است.",
      excerpt: "این خلاصه است.",
      keywords: ["ذهنی سازی", "دلبستگی"],
      readingTime: 8,
      authorName: "صادق گل‌رو",
    });
    const preview = buildMetaTagsPreview(article);

    expect(preview.description).toBe("این تنها توضیحات متا است.");
    expect(preview.openGraph.description).toBe("این تنها توضیحات متا است.");
    expect(preview.twitterCard.description).toBe("این تنها توضیحات متا است.");
    for (const value of [preview.description, preview.openGraph.description, preview.twitterCard.description]) {
      expect(value).not.toContain("ذهنی سازی");
      expect(value).not.toContain("دلبستگی");
      expect(value).not.toContain("8");
      expect(value).not.toContain("صادق گل‌رو");
    }
  });
});
