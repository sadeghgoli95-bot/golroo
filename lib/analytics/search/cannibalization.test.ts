import { describe, expect, it } from "vitest";
import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";
import { detectQueryCannibalization, detectPageCannibalization } from "./cannibalization";

function combinedRow(query: string, page: string, overrides: Partial<SearchAnalyticsRow> = {}): SearchAnalyticsRow {
  return { keys: [query, page], clicks: 1, impressions: 10, ctr: 0.1, position: 8, ...overrides };
}

describe("detectQueryCannibalization", () => {
  it("flags a query where more than one page earns meaningful impressions", () => {
    const rows = [
      combinedRow("اضطراب کودک", "/journal/a", { impressions: 40 }),
      combinedRow("اضطراب کودک", "/journal/b", { impressions: 30 }),
      combinedRow("تنها یک صفحه", "/journal/c", { impressions: 50 }),
    ];

    const result = detectQueryCannibalization(rows);
    expect(result).toHaveLength(1);
    expect(result[0].query).toBe("اضطراب کودک");
    expect(result[0].pages.map((p) => p.page)).toEqual(["/journal/a", "/journal/b"]);
    expect(result[0].totalImpressions).toBe(70);
  });

  it("ignores pages with impressions below the meaningful floor", () => {
    const rows = [
      combinedRow("q", "/a", { impressions: 40 }),
      combinedRow("q", "/b", { impressions: 1 }),
    ];
    expect(detectQueryCannibalization(rows)).toEqual([]);
  });
});

describe("detectPageCannibalization", () => {
  it("flags two pages that share at least the minimum number of meaningfully-ranking queries", () => {
    const rows = [
      combinedRow("q1", "/a", { impressions: 20, clicks: 5 }),
      combinedRow("q2", "/a", { impressions: 20, clicks: 3 }),
      combinedRow("q1", "/b", { impressions: 20, clicks: 2 }),
      combinedRow("q2", "/b", { impressions: 20, clicks: 1 }),
      combinedRow("q3", "/c", { impressions: 20, clicks: 9 }),
    ];

    const result = detectPageCannibalization(rows);
    expect(result).toHaveLength(1);
    expect([result[0].page, result[0].overlappingPage].sort()).toEqual(["/a", "/b"]);
    expect(result[0].sharedQueries.map((q) => q.query).sort()).toEqual(["q1", "q2"]);
  });

  it("does not flag pages sharing only one query", () => {
    const rows = [combinedRow("q1", "/a", { impressions: 20 }), combinedRow("q1", "/b", { impressions: 20 })];
    expect(detectPageCannibalization(rows)).toEqual([]);
  });
});
