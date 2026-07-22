import { describe, expect, it } from "vitest";
import { buildStructuredData } from "./structuredData";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";

describe("buildStructuredData", () => {
  it("always generates article and organization schema", () => {
    const data = buildStructuredData(buildTestArticle({ title: "عنوان", canonicalUrl: "https://mirora.ir/journal/x" }));
    expect(data.article["@type"]).toBe("Article");
    expect(data.organization["@type"]).toBe("Organization");
  });

  it("generates FAQ schema only when FAQ items exist", () => {
    const withoutFaq = buildStructuredData(buildTestArticle({ faq: [] }));
    expect(withoutFaq.faq).toBeNull();

    const withFaq = buildStructuredData(
      buildTestArticle({ faq: [{ question: "سوال؟", answer: "پاسخ" }] })
    );
    expect(withFaq.faq?.["@type"]).toBe("FAQPage");
  });

  it("generates a breadcrumb (خانه > ژورنال > article) when canonicalUrl and title exist", () => {
    const data = buildStructuredData(
      buildTestArticle({ title: "عنوان تست", canonicalUrl: "https://mirora.ir/journal/test-slug" })
    );
    expect(data.breadcrumb).not.toBeNull();
    expect(data.breadcrumb?.itemListElement).toHaveLength(3);
    expect(data.breadcrumb?.itemListElement[2].item).toBe("https://mirora.ir/journal/test-slug");
  });

  it("does not generate a breadcrumb without a canonical URL", () => {
    const data = buildStructuredData(buildTestArticle({ canonicalUrl: null, title: "عنوان" }));
    expect(data.breadcrumb).toBeNull();
  });

  it("generates speakable schema only when there is an excerpt to mark as speakable", () => {
    const withExcerpt = buildStructuredData(
      buildTestArticle({ excerpt: "خلاصه", canonicalUrl: "https://mirora.ir/journal/x" })
    );
    expect(withExcerpt.speakable).not.toBeNull();

    const withoutExcerpt = buildStructuredData(buildTestArticle({ excerpt: null, canonicalUrl: "https://mirora.ir/journal/x" }));
    expect(withoutExcerpt.speakable).toBeNull();
  });
});
