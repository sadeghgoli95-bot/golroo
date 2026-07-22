import { describe, expect, it } from "vitest";
import { DEFAULT_ARTICLE_AUTHOR, resolveAuthorName } from "./constants";

describe("resolveAuthorName (single central author default)", () => {
  it("returns the given name when present", () => {
    expect(resolveAuthorName("نویسنده دیگر")).toBe("نویسنده دیگر");
  });

  it("falls back to DEFAULT_ARTICLE_AUTHOR when null", () => {
    expect(resolveAuthorName(null)).toBe(DEFAULT_ARTICLE_AUTHOR);
    expect(resolveAuthorName(null)).toBe("صادق گل‌رو");
  });

  it("falls back to DEFAULT_ARTICLE_AUTHOR when undefined", () => {
    expect(resolveAuthorName(undefined)).toBe(DEFAULT_ARTICLE_AUTHOR);
  });

  it("falls back to DEFAULT_ARTICLE_AUTHOR when blank/whitespace-only", () => {
    expect(resolveAuthorName("   ")).toBe(DEFAULT_ARTICLE_AUTHOR);
  });
});
