import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { getExecutiveOverview, type ExecutiveOverview } from "../site/executiveOverview";
import { getSearchMetricsSafely, getTrafficMetricsSafely, type SafeMetricsResult } from "../safeGoogleMetrics";
import { getPageEngagementSafely, getHighTrafficLowEngagementPages, type HighTrafficLowEngagementItem } from "./pageEngagement";
import { resolveDateRange, getPreviousPeriod } from "../dateRange";
import type { DateRange } from "../types";
import type { SearchMetrics } from "../search/types";
import type { TrafficMetrics } from "../traffic/types";
import { getOpportunityItems, getBiggestOpportunity, type OpportunityItem } from "./opportunityScoring";
import { buildCtrByPositionCurve, estimateGrowthPotential, type GrowthPotentialEstimate } from "./growthPotential";
import { getVisibilityChanges, getLosingVisibility, getBiggestRisk, type VisibilityChange, type BiggestRisk } from "./visibilityTrends";
import { getArticlesNeedingUpdate, getArticlesReadyToRepublish, type NeedsUpdatingItem, type ReadyToRepublishItem } from "./contentFreshness";
import { getBookingSignalItems, countArticlesLinkingToBooking, type BookingSignalItem } from "./bookingSignal";
import { getContentPerformanceRanking, type ContentRankingItem } from "./contentRanking";
import {
  buildQuickWins,
  buildHighImpactTasks,
  buildMaintenanceTasks,
  buildRepublishTasks,
  buildCriticalIssueTasks,
  buildWeeklyActionPlan,
  type Recommendation,
} from "./recommendations";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

function getPrevious30DaysRange(): DateRange {
  const currentBounds = resolveDateRange(LAST_30_DAYS);
  const previousBounds = getPreviousPeriod(currentBounds);
  return { preset: "custom", start: previousBounds.start, end: previousBounds.end };
}

export type GrowthDashboard = {
  executiveOverview: ExecutiveOverview;
  search: SafeMetricsResult<SearchMetrics>;
  previousSearch: SafeMetricsResult<SearchMetrics>;
  traffic: SafeMetricsResult<TrafficMetrics>;
  opportunities: OpportunityItem[];
  biggestOpportunity: OpportunityItem | null;
  growthPotential: GrowthPotentialEstimate[];
  visibilityChanges: VisibilityChange[];
  losingVisibility: VisibilityChange[];
  biggestRisk: BiggestRisk | null;
  needsUpdating: NeedsUpdatingItem[];
  readyToRepublish: ReadyToRepublishItem[];
  highTrafficLowEngagement: HighTrafficLowEngagementItem[];
  highTrafficLowEngagementError: string | null;
  bookingSignal: BookingSignalItem[];
  articlesLinkingToBookingCount: number;
  contentRanking: ContentRankingItem[];
  recommendations: {
    quickWins: Recommendation[];
    highImpactTasks: Recommendation[];
    maintenanceTasks: Recommendation[];
    republishTasks: Recommendation[];
    criticalIssueTasks: Recommendation[];
    weeklyActionPlan: Recommendation[];
  };
};

/**
 * Single orchestrator for app/dashboard/growth/page.tsx — fetches every
 * real data source exactly once (getSiteAnalysis is already 5-min cached;
 * GSC/GA4 calls are already 15-min cached by their own adapters) and
 * composes every Phase 3 module over it. No module here recomputes a
 * score another lib/analytics file already owns (SEO/AEO/GEO/health come
 * straight from ArticleAnalysis; comparisons go through compareValues).
 */
export async function getGrowthDashboard(analyses: ArticleAnalysis[]): Promise<GrowthDashboard> {
  const [search, previousSearch, traffic, pageEngagement] = await Promise.all([
    getSearchMetricsSafely(LAST_30_DAYS),
    getSearchMetricsSafely(getPrevious30DaysRange()),
    getTrafficMetricsSafely(LAST_30_DAYS),
    getPageEngagementSafely(LAST_30_DAYS),
  ]);

  const executiveOverview = getExecutiveOverview(analyses);

  const opportunities = search.data ? getOpportunityItems(search.data.pagesNearFirstPage, analyses) : [];
  const biggestOpportunity = getBiggestOpportunity(opportunities);

  const growthPotential = search.data
    ? (() => {
        const curve = buildCtrByPositionCurve(search.data as SearchMetrics);
        return search.data!.pagesNearFirstPage.map((page) => estimateGrowthPotential(page, curve));
      })()
    : [];

  const visibilityChanges = search.data && previousSearch.data ? getVisibilityChanges(search.data, previousSearch.data, analyses) : [];
  const losingVisibility = getLosingVisibility(visibilityChanges);
  const biggestRisk = getBiggestRisk(losingVisibility, analyses);

  const losingVisibilitySlugs = new Set(losingVisibility.map((item) => item.slug));
  const needsUpdating = getArticlesNeedingUpdate(analyses, losingVisibilitySlugs);

  const opportunitySlugs = new Set(opportunities.map((item) => item.slug));
  const highImpressionLowCtrSlugs = new Set(
    (search.data?.highImpressionLowCtrPages ?? [])
      .map((page) => page.page)
      .map((url) => opportunities.find((item) => item.page === url)?.slug)
      .filter((slug): slug is string => Boolean(slug))
  );
  const readyToRepublish = getArticlesReadyToRepublish(analyses, opportunitySlugs, highImpressionLowCtrSlugs);

  const highTrafficLowEngagement = pageEngagement.data
    ? getHighTrafficLowEngagementPages(pageEngagement.data, traffic.data?.engagementRate.current ?? 0, analyses)
    : [];

  const bookingSignal = getBookingSignalItems(analyses, search.data, traffic.data);
  const articlesLinkingToBookingCount = countArticlesLinkingToBooking(bookingSignal);

  const contentRanking = getContentPerformanceRanking(analyses, search.data, traffic.data);

  const quickWins = buildQuickWins(search.data?.highImpressionLowCtrPages ?? [], analyses);
  const highImpactTasks = buildHighImpactTasks(opportunities);
  const maintenanceTasks = buildMaintenanceTasks(needsUpdating);
  const republishTasks = buildRepublishTasks(readyToRepublish);
  const criticalIssueTasks = buildCriticalIssueTasks(analyses);
  const weeklyActionPlan = buildWeeklyActionPlan([
    ...quickWins,
    ...highImpactTasks,
    ...maintenanceTasks,
    ...republishTasks,
    ...criticalIssueTasks,
  ]);

  return {
    executiveOverview,
    search,
    previousSearch,
    traffic,
    opportunities,
    biggestOpportunity,
    growthPotential,
    visibilityChanges,
    losingVisibility,
    biggestRisk,
    needsUpdating,
    readyToRepublish,
    highTrafficLowEngagement,
    highTrafficLowEngagementError: pageEngagement.error,
    bookingSignal,
    articlesLinkingToBookingCount,
    contentRanking,
    recommendations: { quickWins, highImpactTasks, maintenanceTasks, republishTasks, criticalIssueTasks, weeklyActionPlan },
  };
}
