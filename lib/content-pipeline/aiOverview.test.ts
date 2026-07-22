import { describe, expect, it } from "vitest";
import { buildAiOverviewSummary } from "./aiOverview";

describe("buildAiOverviewSummary", () => {
  it("extracts the first sentences of the body, dropping heading lines", () => {
    const body = [
      "## مقدمه",
      "",
      "اضطراب کودکان یک موضوع مهم در روان‌شناسی رشد است. این پدیده در سنین مختلف بروز می‌کند. عوامل زیادی در آن دخیل هستند.",
    ].join("\n");
    const summary = buildAiOverviewSummary({ body, excerpt: null });
    expect(summary).not.toContain("##");
    expect(summary).toContain("اضطراب کودکان یک موضوع مهم در روان‌شناسی رشد است.");
  });

  it("caps the summary at 3 sentences", () => {
    const body = "جمله یک است طولانی کافی. جمله دو است طولانی کافی. جمله سه است طولانی کافی. جمله چهار است طولانی کافی.";
    const summary = buildAiOverviewSummary({ body, excerpt: null });
    const sentenceCount = summary?.split(/(?<=[.!؟?])\s+/).filter(Boolean).length ?? 0;
    expect(sentenceCount).toBeLessThanOrEqual(3);
  });

  it("falls back to the excerpt when the body is null", () => {
    expect(buildAiOverviewSummary({ body: null, excerpt: "خلاصه مقاله" })).toBe("خلاصه مقاله");
  });

  it("falls back to the excerpt when the body has no usable sentences", () => {
    expect(buildAiOverviewSummary({ body: "کوتاه.", excerpt: "خلاصه" })).toBe("خلاصه");
  });
});
