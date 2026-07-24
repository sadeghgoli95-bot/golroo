import type { DateRange } from "./types";
import type { SearchMetrics } from "./search/types";
import type { SearchIntelligenceMetrics } from "./search/searchIntelligenceTypes";
import type { TrafficMetrics } from "./traffic/types";
import { googleSearchConsoleAdapter } from "./search/googleSearchConsoleAdapter";
import { searchIntelligenceAdapter } from "./search/searchIntelligence";
import { googleAnalyticsAdapter } from "./traffic/googleAnalyticsAdapter";

export type SafeMetricsResult<T> = { data: T | null; error: string | null };

/**
 * Every dashboard page that shows real GSC/GA4 data goes through these
 * two functions instead of calling the adapters directly — one shared
 * place to turn a thrown error (missing credentials, revoked access,
 * API outage) into an honest "not available" result instead of crashing
 * the page or, worse, falling back to a fabricated number.
 */
export async function getSearchMetricsSafely(range: DateRange): Promise<SafeMetricsResult<SearchMetrics>> {
  try {
    return { data: await googleSearchConsoleAdapter.getMetrics(range), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Phase 2 — Search Intelligence's own safe wrapper, same pattern as getSearchMetricsSafely above, wrapping searchIntelligenceAdapter instead of the Phase 1 adapter. */
export async function getSearchIntelligenceSafely(range: DateRange): Promise<SafeMetricsResult<SearchIntelligenceMetrics>> {
  try {
    return { data: await searchIntelligenceAdapter.getMetrics(range), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getTrafficMetricsSafely(range: DateRange): Promise<SafeMetricsResult<TrafficMetrics>> {
  try {
    return { data: await googleAnalyticsAdapter.getMetrics(range), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}
