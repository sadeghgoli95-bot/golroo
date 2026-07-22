import { describe, expect, it } from "vitest";
import { buildTableOfContents } from "./tableOfContents";

describe("buildTableOfContents", () => {
  it("returns an empty tree for no headings", () => {
    expect(buildTableOfContents([])).toEqual([]);
  });

  it("nests H2/H3 headings under their parent H1", () => {
    const tree = buildTableOfContents([
      { level: 1, text: "مقدمه", slug: "a" },
      { level: 2, text: "علائم", slug: "b" },
      { level: 3, text: "علائم جسمی", slug: "c" },
      { level: 2, text: "درمان", slug: "d" },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].text).toBe("مقدمه");
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].text).toBe("علائم");
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].text).toBe("علائم جسمی");
    expect(tree[0].children[1].text).toBe("درمان");
  });

  it("treats multiple same-level headings with no parent as siblings at the root", () => {
    const tree = buildTableOfContents([
      { level: 2, text: "بخش اول", slug: "a" },
      { level: 2, text: "بخش دوم", slug: "b" },
    ]);
    expect(tree).toHaveLength(2);
  });
});
