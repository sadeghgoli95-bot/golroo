import { describe, expect, it } from "vitest";
import { compareValues, compareMetricValue, buildMetricValue } from "./comparison";

describe("compareValues", () => {
  it("computes difference, percentChange, and an upward trend", () => {
    const result = compareValues(120, 100);
    expect(result).toEqual({ current: 120, previous: 100, difference: 20, percentChange: 20, trend: "up" });
  });

  it("computes a downward trend for a decrease", () => {
    const result = compareValues(80, 100);
    expect(result.difference).toBe(-20);
    expect(result.percentChange).toBe(-20);
    expect(result.trend).toBe("down");
  });

  it("reports a flat trend when current equals previous", () => {
    const result = compareValues(50, 50);
    expect(result.difference).toBe(0);
    expect(result.percentChange).toBe(0);
    expect(result.trend).toBe("flat");
  });

  it("returns null percentChange (not Infinity) when previous is 0 and current isn't", () => {
    const result = compareValues(10, 0);
    expect(result.difference).toBe(10);
    expect(result.percentChange).toBeNull();
    expect(result.trend).toBe("up");
  });

  it("treats 0 vs 0 as flat with 0% change, not null", () => {
    const result = compareValues(0, 0);
    expect(result.percentChange).toBe(0);
    expect(result.trend).toBe("flat");
  });

  it("returns a flat, null-previous result when there is no previous value to compare against", () => {
    const result = compareValues(42, null);
    expect(result).toEqual({ current: 42, previous: null, difference: null, percentChange: null, trend: "flat" });
  });
});

describe("compareMetricValue / buildMetricValue", () => {
  it("derives a comparison from a MetricValue's current/previousPeriod fields", () => {
    const metric = buildMetricValue(150, 100);
    expect(compareMetricValue(metric)).toEqual({
      current: 150,
      previous: 100,
      difference: 50,
      percentChange: 50,
      trend: "up",
    });
  });
});
