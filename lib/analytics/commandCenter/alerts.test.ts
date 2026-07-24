import { describe, expect, it } from "vitest";
import { buildAlerts, type BuildAlertsInput } from "./alerts";

function baseInput(overrides: Partial<BuildAlertsInput> = {}): BuildAlertsInput {
  return {
    systemStatus: [],
    biggestRisk: null,
    criticalIssueCount: 0,
    needsUpdatingCount: 0,
    biggestOpportunity: null,
    quickWinsCount: 0,
    historyInsights: [],
    ...overrides,
  };
}

describe("buildAlerts", () => {
  it("returns no alerts when every real signal is clean", () => {
    expect(buildAlerts(baseInput())).toEqual([]);
  });

  it("flags a disconnected core integration as critical", () => {
    const alerts = buildAlerts(
      baseInput({ systemStatus: [{ label: "Google Search Console", status: "not_configured", detail: "خطا" }] })
    );
    expect(alerts.some((a) => a.severity === "critical" && a.message.includes("Google Search Console"))).toBe(true);
  });

  it("does not flag a non-core integration being disconnected", () => {
    const alerts = buildAlerts(baseInput({ systemStatus: [{ label: "Microsoft Clarity", status: "not_configured", detail: "چیزی نیست" }] }));
    expect(alerts).toHaveLength(0);
  });

  it("surfaces a real quick-win count as an opportunity alert", () => {
    const alerts = buildAlerts(baseInput({ quickWinsCount: 3 }));
    expect(alerts).toEqual([expect.objectContaining({ severity: "opportunity" })]);
  });

  it("surfaces critical/warning history insights and treats positive ones as info", () => {
    const alerts = buildAlerts(
      baseInput({
        historyInsights: [
          { id: "1", what: "بد", why: "", impact: "", action: "", severity: "critical" },
          { id: "2", what: "خوب", why: "", impact: "", action: "", severity: "positive" },
        ],
      })
    );
    expect(alerts.find((a) => a.id === "history-1")?.severity).toBe("critical");
    expect(alerts.find((a) => a.id === "history-info-2")?.severity).toBe("info");
  });
});
