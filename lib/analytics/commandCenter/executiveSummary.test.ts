import { describe, expect, it } from "vitest";
import { buildExecutiveSummary } from "./executiveSummary";

const emptyCounts = { critical: 0, warning: 0, opportunity: 0, info: 0 };

describe("buildExecutiveSummary", () => {
  it("states the real risk as the headline when topPriority is a risk", () => {
    const summary = buildExecutiveSummary({
      topPriority: { type: "risk", title: "مقاله الف", detail: "افت کلیک" },
      alertCountsBySeverity: emptyCounts,
      quickWinsCount: 0,
      highImpactCount: 0,
      needsUpdatingCount: 0,
      readyToRepublishCount: 0,
    });
    expect(summary.headline).toContain("ریسک");
    expect(summary.headline).toContain("مقاله الف");
    expect(summary.points).toEqual([]);
  });

  it("states the real opportunity as the headline when topPriority is an opportunity", () => {
    const summary = buildExecutiveSummary({
      topPriority: { type: "opportunity", title: "مقاله ب", detail: "فرصت واقعی" },
      alertCountsBySeverity: emptyCounts,
      quickWinsCount: 0,
      highImpactCount: 0,
      needsUpdatingCount: 0,
      readyToRepublishCount: 0,
    });
    expect(summary.headline).toContain("فرصت");
    expect(summary.headline).toContain("مقاله ب");
  });

  it("gives a truthful fallback headline when there is no real top priority", () => {
    const summary = buildExecutiveSummary({
      topPriority: null,
      alertCountsBySeverity: emptyCounts,
      quickWinsCount: 0,
      highImpactCount: 0,
      needsUpdatingCount: 0,
      readyToRepublishCount: 0,
    });
    expect(summary.headline).toMatch(/سیگنال واقعی کافی/);
  });

  it("omits zero-count points rather than printing filler", () => {
    const summary = buildExecutiveSummary({
      topPriority: null,
      alertCountsBySeverity: { critical: 2, warning: 0, opportunity: 3, info: 0 },
      quickWinsCount: 0,
      highImpactCount: 0,
      needsUpdatingCount: 0,
      readyToRepublishCount: 0,
    });
    expect(summary.points).toHaveLength(2);
    expect(summary.points.some((p) => p.includes("۲") || p.includes("2"))).toBe(true);
  });
});
