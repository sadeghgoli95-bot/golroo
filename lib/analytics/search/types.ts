import type { MetricValue } from "../types";

export type SearchQueryMetric = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type SearchPageMetric = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type SearchMetrics = {
  clicks: MetricValue;
  impressions: MetricValue;
  ctr: MetricValue;
  averagePosition: MetricValue;
  topQueries: SearchQueryMetric[];
  fastestGrowingQueries: SearchQueryMetric[];
  losingQueries: SearchQueryMetric[];
  brandQueries: SearchQueryMetric[];
  nonBrandQueries: SearchQueryMetric[];
  /** Ranked by clicks, descending. */
  topPages: SearchPageMetric[];
  /** Average position between 11 and 20 — one page short of page 1. */
  pagesNearFirstPage: SearchPageMetric[];
  /** High impressions but a below-average CTR — real search visibility that isn't converting to clicks. */
  highImpressionLowCtrPages: SearchPageMetric[];
};
