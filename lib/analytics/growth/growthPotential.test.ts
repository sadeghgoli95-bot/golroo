import { describe, it, expect } from "vitest";
import { buildCtrByPositionCurve, estimateGrowthPotential } from "./growthPotential";
import type { SearchMetrics, SearchPageMetric } from "../search/types";

function metrics(overrides: Partial<SearchMetrics> = {}): SearchMetrics {
  return {
    clicks: { current: 0, previousPeriod: null, previousYear: null },
    impressions: { current: 0, previousPeriod: null, previousYear: null },
    ctr: { current: 0, previousPeriod: null, previousYear: null },
    averagePosition: { current: 0, previousPeriod: null, previousYear: null },
    topQueries: [],
    fastestGrowingQueries: [],
    losingQueries: [],
    brandQueries: [],
    nonBrandQueries: [],
    topPages: [],
    pagesNearFirstPage: [],
    highImpressionLowCtrPages: [],
    ...overrides,
  };
}

function page(overrides: Partial<SearchPageMetric> = {}): SearchPageMetric {
  return { page: "/journal/a", clicks: 5, impressions: 100, ctr: 0.05, averagePosition: 5, ...overrides };
}

describe("buildCtrByPositionCurve", () => {
  it("builds a real average-CTR-per-bucket curve from the union of the three exposed page slices", () => {
    const curve = buildCtrByPositionCurve(
      metrics({ topPages: [page({ page: "/journal/a", averagePosition: 5, ctr: 0.1 })] })
    );
    const bucket46 = curve.find((b) => b.label === "4-6")!;
    expect(bucket46.sampleSize).toBe(1);
    expect(bucket46.averageCtr).toBeCloseTo(0.1);
  });

  it("dedupes the same page appearing in multiple slices", () => {
    const p = page({ page: "/journal/a", averagePosition: 5, ctr: 0.2 });
    const curve = buildCtrByPositionCurve(metrics({ topPages: [p], pagesNearFirstPage: [], highImpressionLowCtrPages: [p] }));
    expect(curve.find((b) => b.label === "4-6")!.sampleSize).toBe(1);
  });

  it("leaves a bucket at sampleSize 0 when no real page occupies it", () => {
    const curve = buildCtrByPositionCurve(metrics());
    expect(curve.every((bucket) => bucket.sampleSize === 0)).toBe(true);
  });
});

describe("estimateGrowthPotential", () => {
  it("projects click uplift from the real 4-6 bucket average CTR", () => {
    const curve = buildCtrByPositionCurve(metrics({ topPages: [page({ page: "/journal/target", averagePosition: 5, ctr: 0.2 })] }));
    const nearTop10Page = page({ page: "/journal/near", averagePosition: 12, ctr: 0.05, impressions: 200 });
    const estimate = estimateGrowthPotential(nearTop10Page, curve);

    expect(estimate.projectedCtr).toBeCloseTo(0.2);
    expect(estimate.estimatedClickUplift).toBe(Math.round(200 * (0.2 - 0.05)));
    expect(estimate.insufficientDataReason).toBeNull();
  });

  it("returns an honest insufficient-data result instead of guessing when the target bucket has no real sample", () => {
    const curve = buildCtrByPositionCurve(metrics());
    const nearTop10Page = page({ averagePosition: 12 });
    const estimate = estimateGrowthPotential(nearTop10Page, curve);

    expect(estimate.projectedCtr).toBeNull();
    expect(estimate.estimatedClickUplift).toBeNull();
    expect(estimate.insufficientDataReason).not.toBeNull();
  });
});
