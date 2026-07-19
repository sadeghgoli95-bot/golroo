import type { MetricValue } from "../types";

export type SearchQueryMetric = {
  query: string;
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
};
