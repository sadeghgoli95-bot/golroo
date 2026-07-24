import type { MetricValue } from "../types";
import type { ChartPoint } from "../charts/types";
import type { SearchQueryMetric, SearchPageMetric } from "./types";
import type { QueryMoverMetric, TrendingQueryMetric } from "./queryDiff";
import type { QueryCannibalization, PageCannibalization } from "./cannibalization";
import type { SearchIntent } from "./intentClassifier";

export type { QueryMoverMetric, TrendingQueryMetric, QueryCannibalization, PageCannibalization, SearchIntent };

export type IntentBreakdownItem = {
  intent: SearchIntent;
  label: string;
  queryCount: number;
  clicks: number;
  impressions: number;
};

/** A generic (label, clicks/impressions/ctr/position) row shared by the country/device/searchAppearance breakdowns — each is the same shape from a different GSC dimension. */
export type SearchDimensionMetric = {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type SearchInsight = {
  id: string;
  message: string;
  severity: "info" | "positive" | "warning";
};

export type SearchIntelligenceMetrics = {
  clicks: MetricValue;
  impressions: MetricValue;
  ctr: MetricValue;
  averagePosition: MetricValue;

  /** Top 25 by clicks — fuller list than Phase 1's top-10 topQueries/topPages. */
  topQueries: SearchQueryMetric[];
  topPages: SearchPageMetric[];

  winningKeywords: QueryMoverMetric[];
  losingKeywords: QueryMoverMetric[];
  newQueries: SearchQueryMetric[];
  lostQueries: SearchQueryMetric[];
  trendingQueries: TrendingQueryMetric[];

  /** Average position 11-20 (same concept as Phase 1's pagesNearFirstPage). */
  pagesNearTop10: SearchPageMetric[];
  highImpressionLowCtrPages: SearchPageMetric[];
  /** "Hidden gems" — above-average CTR but low impression volume. */
  highCtrLowImpressionPages: SearchPageMetric[];

  queryCannibalization: QueryCannibalization[];
  pageCannibalization: PageCannibalization[];

  brandQueries: SearchQueryMetric[];
  nonBrandQueries: SearchQueryMetric[];
  /** Share (0-1) of total clicks that came from brand queries, or null if there were no clicks at all in the period. */
  brandClicksShare: number | null;

  intentBreakdown: IntentBreakdownItem[];

  countryBreakdown: SearchDimensionMetric[];
  deviceBreakdown: SearchDimensionMetric[];
  searchAppearanceBreakdown: SearchDimensionMetric[];

  clicksTrend: ChartPoint[];
  impressionsTrend: ChartPoint[];
  ctrTrend: ChartPoint[];
  positionTrend: ChartPoint[];
  /** Count of distinct active queries/pages (clicks > 0) per weekly bucket within the selected range. */
  queryGrowthTrend: ChartPoint[];
  pageGrowthTrend: ChartPoint[];

  insights: SearchInsight[];
};
