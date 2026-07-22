import { describe, expect, it } from "vitest";
import { extractExcerpt } from "./extractExcerpt";

describe("extractExcerpt priority chain (Meta Description -> first paragraph -> first 180 chars)", () => {
  it("uses Meta Description when present, ignoring the body entirely", () => {
    const body = "# عنوان\n\nاین یک پاراگراف کاملاً متفاوت از توضیحات متا است.";
    expect(extractExcerpt(body, "این توضیحات متا است.")).toBe("این توضیحات متا است.");
  });

  it("falls back to the first paragraph of the body when Meta Description is missing", () => {
    const body = "# عنوان\n\nاین اولین پاراگراف مقاله است.\n\n## بخش بعدی\n\nاین پاراگراف دوم است.";
    expect(extractExcerpt(body, null)).toBe("این اولین پاراگراف مقاله است.");
  });

  it("falls back to the first 180 characters of the body when there is no Meta Description and no clean paragraph break", () => {
    const longSingleLine = "کلمه ".repeat(80).trim();
    const result = extractExcerpt(longSingleLine, null);
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(181); // 180 + ellipsis char
    expect(result!.endsWith("…")).toBe(true);
  });

  it("truncates at a whole word, never mid-word", () => {
    const longSingleLine = "کلمه ".repeat(80).trim();
    const result = extractExcerpt(longSingleLine, null)!;
    const withoutEllipsis = result.replace(/…$/, "").trim();
    expect(withoutEllipsis.split(" ").every((word) => word === "کلمه")).toBe(true);
  });

  it("returns null when there is no Meta Description and no body", () => {
    expect(extractExcerpt(null, null)).toBeNull();
  });

  it("skips heading lines when finding the first paragraph", () => {
    const body = "# عنوان اصلی\n## زیرعنوان\n\nاین اولین پاراگراف واقعی است.";
    expect(extractExcerpt(body, null)).toBe("این اولین پاراگراف واقعی است.");
  });
});
