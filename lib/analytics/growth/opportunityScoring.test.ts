import { describe, it, expect } from "vitest";
import { getOpportunityItems, getBiggestOpportunity } from "./opportunityScoring";
import { buildTestAnalysis } from "../site/testFixtures";
import type { SearchPageMetric } from "../search/types";

function page(overrides: Partial<SearchPageMetric> = {}): SearchPageMetric {
  return { page: "https://golroo.ir/journal/khab-koodak", clicks: 10, impressions: 500, ctr: 0.02, averagePosition: 15, ...overrides };
}

describe("getOpportunityItems", () => {
  it("joins a near-first-page GSC row to its real article and computes opportunity/priority/impact", () => {
    const analysis = buildTestAnalysis({ article: { slug: "khab-koodak", lastUpdated: null, publishedAt: null } });
    const items = getOpportunityItems([page()], [analysis]);

    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("khab-koodak");
    expect(items[0].opportunityScore).toBe(Math.round(500 * (1 - 0.02) * (20 - 15)));
    expect(items[0].impactScore).toBe(10);
    // no lastUpdated/publishedAt -> recencyWeight 1 -> priority === opportunity
    expect(items[0].priorityScore).toBe(items[0].opportunityScore);
  });

  it("boosts priority for stale articles via recencyWeight without inventing a value when dates are unknown", () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 400); // > 365 days ago -> recencyWeight capped at 2
    const analysis = buildTestAnalysis({
      article: { slug: "khab-koodak", lastUpdated: staleDate.toISOString(), publishedAt: null },
    });
    const items = getOpportunityItems([page()], [analysis]);
    expect(items[0].priorityScore).toBe(items[0].opportunityScore * 2);
  });

  it("skips rows that don't resolve to a known article instead of guessing", () => {
    const analysis = buildTestAnalysis({ article: { slug: "other-slug" } });
    const items = getOpportunityItems([page()], [analysis]);
    expect(items).toHaveLength(0);
  });
});

describe("getBiggestOpportunity", () => {
  it("returns the highest-priority item, or null when there is none", () => {
    expect(getBiggestOpportunity([])).toBeNull();

    const low = { slug: "a", title: "a", page: "p", impressions: 1, ctr: 0, averagePosition: 12, clicks: 0, opportunityScore: 5, priorityScore: 5, impactScore: 0 };
    const high = { ...low, slug: "b", priorityScore: 50 };
    expect(getBiggestOpportunity([low, high])?.slug).toBe("b");
  });
});
