import { client } from "@/sanity/lib/client";
import { listAccessibleSites } from "@/lib/google/searchConsoleClient";
import { runReport } from "@/lib/google/ga4Client";
import { getGscSiteUrl, isGoogleAnalyticsConfigured, isSearchConsoleConfigured } from "@/lib/google/config";
import { getLatestSnapshot } from "@/lib/analytics/snapshot/SnapshotRepository";
import { createMemoryCache, withCache } from "@/lib/article/cache";

export type ProviderStatus = "connected" | "not_configured";

export type SystemStatusItem = {
  label: string;
  status: ProviderStatus;
  detail: string;
  lastSyncedAt?: string | null;
};

const STATUS_CACHE_TTL_MS = 5 * 60 * 1000; // live API probes are real network calls — cached so the Settings page doesn't re-probe on every render
const cache = createMemoryCache<SystemStatusItem[]>(STATUS_CACHE_TTL_MS);
const CACHE_KEY = "system-status";

async function checkSanity(): Promise<SystemStatusItem> {
  const hasProject = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  const hasDataset = Boolean(process.env.NEXT_PUBLIC_SANITY_DATASET);
  if (!hasProject || !hasDataset) {
    return { label: "Sanity — خواندن (Read)", status: "not_configured", detail: "NEXT_PUBLIC_SANITY_PROJECT_ID یا NEXT_PUBLIC_SANITY_DATASET تنظیم نشده" };
  }

  try {
    await client.fetch<number>("count(*[0...1])");
    return { label: "Sanity — خواندن (Read)", status: "connected", detail: "اتصال زنده تأیید شد" };
  } catch (error) {
    return {
      label: "Sanity — خواندن (Read)",
      status: "not_configured",
      detail: `خطای اتصال: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkSearchConsole(): Promise<SystemStatusItem> {
  if (!isSearchConsoleConfigured()) {
    return { label: "Google Search Console", status: "not_configured", detail: "GOOGLE_SERVICE_ACCOUNT_KEY یا GSC_SITE_URL تنظیم نشده" };
  }

  try {
    const sites = await listAccessibleSites();
    const siteUrl = getGscSiteUrl();
    const hasAccess = sites.some((site) => site.siteUrl === siteUrl);
    if (!hasAccess) {
      return {
        label: "Google Search Console",
        status: "not_configured",
        detail: `Service Account به ${siteUrl} دسترسی ندارد`,
      };
    }
    return { label: "Google Search Console", status: "connected", detail: "اتصال زنده تأیید شد" };
  } catch (error) {
    return {
      label: "Google Search Console",
      status: "not_configured",
      detail: `خطای اتصال: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function checkGa4(): Promise<SystemStatusItem> {
  if (!isGoogleAnalyticsConfigured()) {
    return { label: "Google Analytics 4", status: "not_configured", detail: "GOOGLE_SERVICE_ACCOUNT_KEY یا GA4_PROPERTY_ID تنظیم نشده" };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    await runReport({ startDate: today, endDate: today, metrics: ["activeUsers"] });
    return { label: "Google Analytics 4", status: "connected", detail: "اتصال زنده تأیید شد" };
  } catch (error) {
    return {
      label: "Google Analytics 4",
      status: "not_configured",
      detail: `خطای اتصال: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function buildSystemStatus(): Promise<SystemStatusItem[]> {
  const hasSanityWriteToken = Boolean(process.env.SANITY_API_TOKEN);
  const isProduction = process.env.NODE_ENV === "production";

  const [sanityRead, searchConsole, ga4, latestSnapshot] = await Promise.all([
    checkSanity(),
    checkSearchConsole(),
    checkGa4(),
    getLatestSnapshot().catch(() => null),
  ]);

  const lastSyncedAt = latestSnapshot?.timestamp ?? null;

  return [
    {
      label: "مخزن مقالات (Repository)",
      status: isProduction && sanityRead.status === "connected" ? "connected" : "not_configured",
      detail: isProduction ? sanityRead.detail : "Memory (فقط محیط توسعه)",
    },
    sanityRead,
    {
      label: "Sanity — نوشتن پیش‌نویس (Write)",
      status: hasSanityWriteToken ? "connected" : "not_configured",
      detail: hasSanityWriteToken ? "پیکربندی شده" : "SANITY_API_TOKEN تنظیم نشده",
    },
    {
      label: "هوش مصنوعی (AI Provider)",
      status: "not_configured",
      detail: "هیچ Provider واقعی به AIProvider متصل نشده است",
    },
    { ...ga4, lastSyncedAt },
    { ...searchConsole, lastSyncedAt },
    {
      label: "Microsoft Clarity",
      status: "not_configured",
      detail: "هیچ اسکریپت یا پیکربندی Clarity در پروژه وجود ندارد",
    },
  ];
}

/**
 * Every GA4/GSC/Sanity row here is a real, live API probe — not just an
 * env-var presence check — cached for 5 minutes so the Settings page
 * doesn't re-probe Google's APIs on every render. Microsoft Clarity has
 * no integration anywhere in this codebase (confirmed by grep), so it
 * honestly stays "not_configured" with no live check to run.
 */
export async function getSystemStatus(): Promise<SystemStatusItem[]> {
  return withCache(cache, CACHE_KEY, buildSystemStatus);
}
