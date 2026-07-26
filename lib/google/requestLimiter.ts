/**
 * Global concurrency limiter for every real Google API call this project
 * makes (GA4 Data API, Search Console API). The dashboard's analytics
 * modules (conversionSummary.ts, funnel.ts, trends.ts, contentAttribution.ts,
 * businessInsights.ts, searchIntelligence.ts, ...) each independently fan
 * out with their own Promise.all — a page-local queue in any one of them
 * wouldn't help, since a single dashboard page load composes several of
 * these modules at once (see lib/analytics/commandCenter/getCommandCenter.ts)
 * with no knowledge of each other's concurrency. This is the one shared
 * choke point every runReport/querySearchAnalytics call passes through
 * (see lib/google/ga4Client.ts, lib/google/searchConsoleClient.ts), so the
 * limit is enforced globally regardless of which page or how many nested
 * Promise.all calls triggered the request. Plain in-house semaphore — no
 * external dependency (none of p-limit/p-queue/async-sema is installed).
 */
const MAX_CONCURRENT_REQUESTS = 5;

let activeCount = 0;
const queue: (() => void)[] = [];

function acquire(): Promise<void> {
  if (activeCount < MAX_CONCURRENT_REQUESTS) {
    activeCount += 1;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    queue.push(() => {
      activeCount += 1;
      resolve();
    });
  });
}

function release(): void {
  activeCount -= 1;
  const next = queue.shift();
  if (next) next();
}

/** Runs `fn` once a slot is free (never more than MAX_CONCURRENT_REQUESTS in flight at once), releasing the slot whether `fn` resolves or rejects. */
export async function limitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}
