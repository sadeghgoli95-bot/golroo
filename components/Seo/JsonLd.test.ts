import { describe, expect, it } from "vitest";
import { articleJsonLd } from "./JsonLd";
import { DEFAULT_ARTICLE_AUTHOR } from "@/lib/article/constants";

describe("articleJsonLd author fallback (single source of truth)", () => {
  it("uses the given author name when present", () => {
    const data = articleJsonLd({ title: "عنوان", url: "https://mirora.ir/journal/x", authorName: "نویسنده" });
    expect(data.author.name).toBe("نویسنده");
  });

  it("falls back to the central DEFAULT_ARTICLE_AUTHOR, not the site's general Person name, when no author is given", () => {
    const data = articleJsonLd({ title: "عنوان", url: "https://mirora.ir/journal/x" });
    expect(data.author.name).toBe(DEFAULT_ARTICLE_AUTHOR);
    expect(data.author.name).toBe("صادق گل‌رو");
  });
});
