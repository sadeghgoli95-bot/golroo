import { describe, expect, it } from "vitest";
import { buildCanonicalUrl } from "./canonicalUrl";

describe("buildCanonicalUrl (single implementation for every mapper)", () => {
  it("builds the canonical URL from the site URL and slug", () => {
    expect(buildCanonicalUrl("child-anxiety")).toBe("https://mirora.ir/journal/child-anxiety");
  });

  it("returns null when there is no slug", () => {
    expect(buildCanonicalUrl(null)).toBeNull();
  });
});
