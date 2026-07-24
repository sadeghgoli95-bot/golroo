import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./targets.config", () => ({
  KPI_TARGETS: { siteHealthScore: 90, avgSeoScore: null },
}));

describe("buildExecutiveKpi", () => {
  beforeEach(() => vi.resetModules());

  it("computes a real progress percent when a target is configured", async () => {
    const { buildExecutiveKpi } = await import("./executiveKpis");
    const kpi = buildExecutiveKpi("siteHealthScore" as never, "امتیاز سلامت", 45);
    expect(kpi.target).toBe(90);
    expect(kpi.progressPercent).toBe(50);
  });

  it("returns null progress when no target is configured", async () => {
    const { buildExecutiveKpi } = await import("./executiveKpis");
    const kpi = buildExecutiveKpi("avgSeoScore" as never, "امتیاز سئو", 70);
    expect(kpi.target).toBeNull();
    expect(kpi.progressPercent).toBeNull();
  });

  it("returns null progress when the current value is unknown", async () => {
    const { buildExecutiveKpi } = await import("./executiveKpis");
    const kpi = buildExecutiveKpi("siteHealthScore" as never, "امتیاز سلامت", null);
    expect(kpi.progressPercent).toBeNull();
  });
});
