import { describe, expect, it } from "vitest";
import { resolveReportStatus } from "./reportStatus";

const base = { hasRealData: true, criticalIssueCount: 0, biggestRiskPresent: false, needsUpdatingCount: 0, regressionCount: 0 };

describe("resolveReportStatus", () => {
  it("returns insufficient_data when there is no real signal at all", () => {
    expect(resolveReportStatus({ ...base, hasRealData: false, criticalIssueCount: 5 })).toBe("insufficient_data");
  });

  it("returns at_risk when a real critical issue exists", () => {
    expect(resolveReportStatus({ ...base, criticalIssueCount: 1 })).toBe("at_risk");
  });

  it("returns at_risk when a real biggest-risk signal exists", () => {
    expect(resolveReportStatus({ ...base, biggestRiskPresent: true })).toBe("at_risk");
  });

  it("returns needs_attention when a real stale article exists but no risk/critical signal", () => {
    expect(resolveReportStatus({ ...base, needsUpdatingCount: 1 })).toBe("needs_attention");
  });

  it("returns needs_attention when a real regression exists but no risk/critical signal", () => {
    expect(resolveReportStatus({ ...base, regressionCount: 1 })).toBe("needs_attention");
  });

  it("returns healthy when every real signal is clean", () => {
    expect(resolveReportStatus(base)).toBe("healthy");
  });

  it("prioritizes at_risk over needs_attention when both are present", () => {
    expect(resolveReportStatus({ ...base, criticalIssueCount: 1, needsUpdatingCount: 3 })).toBe("at_risk");
  });
});
