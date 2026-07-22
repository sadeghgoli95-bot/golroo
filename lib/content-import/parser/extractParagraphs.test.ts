import { describe, expect, it } from "vitest";
import { firstParagraph, firstMeaningfulParagraph, truncateAtWholeWord } from "./extractParagraphs";

describe("firstParagraph", () => {
  it("returns the first non-heading paragraph", () => {
    const body = "# تیتر\n\nپاراگراف اول.\n\n## بخش دوم\n\nپاراگراف دوم.";
    expect(firstParagraph(body)).toBe("پاراگراف اول.");
  });

  it("joins multi-line paragraphs with a space", () => {
    const body = "# تیتر\n\nخط اول.\nخط دوم.";
    expect(firstParagraph(body)).toBe("خط اول. خط دوم.");
  });

  it("returns null for a body with no paragraphs", () => {
    expect(firstParagraph("# فقط تیتر")).toBeNull();
  });
});

describe("firstMeaningfulParagraph", () => {
  it("skips a trivially short first paragraph", () => {
    const body = "کوتاه.\n\nاین پاراگراف دوم طولانی‌تر و معنادارتر است تا انتخاب شود.";
    expect(firstMeaningfulParagraph(body)).toContain("پاراگراف دوم");
  });

  it("falls back to the first paragraph when nothing qualifies as meaningful", () => {
    const body = "کوتاه.\n\nهم.";
    expect(firstMeaningfulParagraph(body)).toBe("کوتاه.");
  });
});

describe("truncateAtWholeWord", () => {
  it("returns the text unchanged when within the limit", () => {
    expect(truncateAtWholeWord("متن کوتاه", 100)).toBe("متن کوتاه");
  });

  it("truncates at the last whole word and appends an ellipsis", () => {
    const result = truncateAtWholeWord("یک دو سه چهار پنج", 10);
    expect(result.endsWith("…")).toBe(true);
    expect(result.replace(/…$/, "").endsWith(" ")).toBe(false);
  });
});
