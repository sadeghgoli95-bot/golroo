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
