import { describe, expect, it } from "vitest";
import { getDateRangeBounds, getPreviousPeriod } from "./dateRange";

describe("getDateRangeBounds", () => {
  it("resolves today/yesterday to a single-day range, offset by the reporting lag", () => {
    const today = getDateRangeBounds("today");
    expect(today.start).toBe(today.end);

    const yesterday = getDateRangeBounds("yesterday");
    expect(yesterday.start).toBe(yesterday.end);
    expect(new Date(yesterday.start).getTime()).toBeLessThan(new Date(today.start).getTime());
  });

  it("resolves last7Days to a 7-day span", () => {
    const range = getDateRangeBounds("last7Days");
    const days = Math.round((new Date(range.end).getTime() - new Date(range.start).getTime()) / 86400000) + 1;
    expect(days).toBe(7);
  });

  it("resolves last30Days/last90Days to their exact span lengths", () => {
    const days30 = getDateRangeBounds("last30Days");
    const span30 = Math.round((new Date(days30.end).getTime() - new Date(days30.start).getTime()) / 86400000) + 1;
    expect(span30).toBe(30);

    const days90 = getDateRangeBounds("last90Days");
    const span90 = Math.round((new Date(days90.end).getTime() - new Date(days90.start).getTime()) / 86400000) + 1;
    expect(span90).toBe(90);
  });
});

describe("getPreviousPeriod", () => {
  it("returns the immediately-preceding period of equal length", () => {
    const current = { start: "2026-07-15", end: "2026-07-21" }; // 7 days
    const previous = getPreviousPeriod(current);
    expect(previous).toEqual({ start: "2026-07-08", end: "2026-07-14" });
  });

  it("handles a single-day range", () => {
    const current = { start: "2026-07-21", end: "2026-07-21" };
    const previous = getPreviousPeriod(current);
    expect(previous).toEqual({ start: "2026-07-20", end: "2026-07-20" });
  });
});
