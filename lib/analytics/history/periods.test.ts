import { describe, expect, it } from "vitest";
import { getBucketStart, addPeriods, getComparisonBounds, getCustomComparisonBounds } from "./periods";

describe("getBucketStart", () => {
  it("returns the ISO Monday for 'week' granularity", () => {
    const wednesday = new Date("2026-07-08T15:00:00.000Z"); // a Wednesday
    const start = getBucketStart("week", wednesday);
    expect(start.toISOString().slice(0, 10)).toBe("2026-07-06"); // Monday of that week
  });

  it("returns the 1st of the month for 'month' granularity", () => {
    const start = getBucketStart("month", new Date("2026-07-23T00:00:00.000Z"));
    expect(start.toISOString().slice(0, 10)).toBe("2026-07-01");
  });

  it("returns Jan 1 for 'year' granularity", () => {
    const start = getBucketStart("year", new Date("2026-07-23T00:00:00.000Z"));
    expect(start.toISOString().slice(0, 10)).toBe("2026-01-01");
  });
});

describe("addPeriods", () => {
  it("adds whole weeks", () => {
    const result = addPeriods("week", new Date("2026-07-06T00:00:00.000Z"), 1);
    expect(result.toISOString().slice(0, 10)).toBe("2026-07-13");
  });

  it("subtracts whole months", () => {
    const result = addPeriods("month", new Date("2026-07-01T00:00:00.000Z"), -1);
    expect(result.toISOString().slice(0, 10)).toBe("2026-06-01");
  });
});

describe("getComparisonBounds", () => {
  it("returns the current day and the immediately preceding day for 'day'", () => {
    const { current, previous } = getComparisonBounds("day", new Date("2026-07-23T10:00:00.000Z"));
    expect(current.start.toISOString().slice(0, 10)).toBe("2026-07-23");
    expect(previous.start.toISOString().slice(0, 10)).toBe("2026-07-22");
    expect(previous.end.getTime()).toBe(current.start.getTime());
  });
});

describe("getCustomComparisonBounds", () => {
  it("computes a previous range of the same duration immediately before the current one", () => {
    const start = new Date("2026-07-10T00:00:00.000Z");
    const end = new Date("2026-07-15T00:00:00.000Z"); // 5-day range
    const { current, previous } = getCustomComparisonBounds(start, end);
    expect(current).toEqual({ start, end });
    expect(previous.end.getTime()).toBe(start.getTime());
    expect(previous.start.toISOString()).toBe("2026-07-05T00:00:00.000Z");
  });
});
