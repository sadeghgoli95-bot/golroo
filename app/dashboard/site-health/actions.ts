"use server";

import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { checkExternalLinks, type ExternalLinkCheckResult } from "@/lib/analytics/site/checkExternalLinks";

/**
 * On-demand only — never runs during a page's own SSR render, so no
 * dashboard page load ever blocks on outbound network calls. Triggered
 * exclusively by the "بررسی لینک‌های خارجی" button in
 * components/dashboard/site-health/ExternalLinkChecker.tsx.
 */
export async function checkSiteExternalLinksAction(): Promise<ExternalLinkCheckResult[]> {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const urls = analyses.flatMap((item) => item.externalLinkUrls);
  return checkExternalLinks(urls);
}
