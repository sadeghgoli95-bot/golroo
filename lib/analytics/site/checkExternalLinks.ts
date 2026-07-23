export type ExternalLinkCheckResult = {
  url: string;
  ok: boolean;
  status: number | null;
  error: string | null;
};

const TIMEOUT_MS = 4000;
const BATCH_SIZE = 5;

async function checkOne(url: string): Promise<ExternalLinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    // Some servers reject HEAD outright — a real GET is the only honest way to know then.
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    return { url, ok: response.ok, status: response.status, error: null };
  } catch (error) {
    return { url, ok: false, status: null, error: error instanceof Error ? error.message : "خطای شبکه" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Real outbound HTTP checks, run on-demand only (never on a page's own
 * SSR render — see app/dashboard/site-health/actions.ts) so no dashboard
 * page load ever blocks on external network latency. Batched, not
 * parallel-unbounded, to stay a reasonable citizen toward the (often
 * small, low-traffic) sites being checked.
 */
export async function checkExternalLinks(urls: string[]): Promise<ExternalLinkCheckResult[]> {
  const uniqueUrls = Array.from(new Set(urls));
  const results: ExternalLinkCheckResult[] = [];

  for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
    const batch = uniqueUrls.slice(i, i + BATCH_SIZE);
    results.push(...(await Promise.all(batch.map(checkOne))));
  }

  return results;
}
