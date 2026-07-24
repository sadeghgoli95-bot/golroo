import type { SearchMetrics, SearchPageMetric } from "../search/types";
import { round } from "./shared";

export type CtrPositionBucket = {
  label: string;
  minPosition: number;
  maxPosition: number;
  /** Real average CTR observed across the site's own pages currently sitting in this position range. */
  averageCtr: number;
  sampleSize: number;
};

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "1-3", min: 1, max: 3 },
  { label: "4-6", min: 4, max: 6 },
  { label: "7-10", min: 7, max: 10 },
  { label: "11-20", min: 11, max: 20 },
];

/**
 * Estimated Growth Potential (item 15) needs a real CTR-by-position
 * curve. This project's GSC adapter doesn't expose the full per-page
 * dataset (only topPages, pagesNearFirstPage, highImpressionLowCtrPages),
 * so rather than assume a generic industry CTR-by-position curve — which
 * would be exactly the kind of invented number the project forbids — this
 * builds the curve from the union of those three real, already-fetched
 * page lists (deduplicated by page URL). It is a small, real, site-own
 * sample: honest but limited. Buckets with zero real samples stay at
 * `sampleSize: 0` / `averageCtr: 0` and callers must treat that as
 * "insufficient data", never as "0% CTR".
 */
export function buildCtrByPositionCurve(metrics: SearchMetrics): CtrPositionBucket[] {
  const byPage = new Map<string, SearchPageMetric>();
  for (const page of [...metrics.topPages, ...metrics.pagesNearFirstPage, ...metrics.highImpressionLowCtrPages]) {
    byPage.set(page.page, page);
  }
  const pages = Array.from(byPage.values());

  return BUCKETS.map((bucket) => {
    const inBucket = pages.filter((page) => page.averagePosition >= bucket.min && page.averagePosition <= bucket.max);
    const averageCtr = inBucket.length === 0 ? 0 : inBucket.reduce((sum, page) => sum + page.ctr, 0) / inBucket.length;
    return {
      label: bucket.label,
      minPosition: bucket.min,
      maxPosition: bucket.max,
      averageCtr,
      sampleSize: inBucket.length,
    };
  });
}

export type GrowthPotentialEstimate = {
  page: string;
  currentPosition: number;
  currentCtr: number;
  impressions: number;
  targetBucketLabel: string;
  /** Real average CTR of the site's own pages already ranking in the target bucket — the projection input. */
  projectedCtr: number | null;
  /** estimatedClickUplift = round(impressions × max(0, projectedCtr − currentCtr)). Null when the target bucket has no real sample to project from. */
  estimatedClickUplift: number | null;
  /** Explains why no estimate is shown, when applicable. */
  insufficientDataReason: string | null;
};

const TARGET_BUCKET = BUCKETS[1]; // "4-6" — the spec's example target ("reached position 5").

/**
 * Realistic click uplift if a near-top-10 page reached position 5,
 * projected using the site's own real CTR-by-position curve (see
 * buildCtrByPositionCurve) — never a fabricated industry-average CTR
 * curve. Formula: estimatedClickUplift = impressions × max(0, projectedCtr − currentCtr),
 * rounded. If the target bucket has zero real samples, this returns an
 * honest "insufficient data" result instead of guessing a number.
 */
export function estimateGrowthPotential(page: SearchPageMetric, curve: CtrPositionBucket[]): GrowthPotentialEstimate {
  const targetBucket = curve.find((bucket) => bucket.label === TARGET_BUCKET.label) ?? null;
  const hasSample = targetBucket !== null && targetBucket.sampleSize > 0;

  return {
    page: page.page,
    currentPosition: page.averagePosition,
    currentCtr: page.ctr,
    impressions: page.impressions,
    targetBucketLabel: TARGET_BUCKET.label,
    projectedCtr: hasSample ? targetBucket!.averageCtr : null,
    estimatedClickUplift: hasSample
      ? round(page.impressions * Math.max(0, targetBucket!.averageCtr - page.ctr))
      : null,
    insufficientDataReason: hasSample
      ? null
      : `هیچ صفحه واقعی سایت در حال حاضر در بازه جایگاه ${TARGET_BUCKET.label} قرار ندارد تا مبنای تخمین باشد`,
  };
}
