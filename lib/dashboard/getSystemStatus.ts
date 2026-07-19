export type ProviderStatus = "connected" | "not_configured";

export type SystemStatusItem = {
  label: string;
  status: ProviderStatus;
  detail: string;
};

/**
 * Reads only environment-variable presence and NODE_ENV — no network
 * calls, so this never blocks on or fails against an external service.
 * Every "not_configured" here reflects a real absence (see
 * lib/article/repositories/RepositoryFactory.ts and lib/ai/types.ts),
 * never a guess.
 */
export function getSystemStatus(): SystemStatusItem[] {
  const hasSanityProject = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  const hasSanityDataset = Boolean(process.env.NEXT_PUBLIC_SANITY_DATASET);
  const hasSanityWriteToken = Boolean(process.env.SANITY_API_TOKEN);
  const isProduction = process.env.NODE_ENV === "production";
  const sanityReadReady = hasSanityProject && hasSanityDataset;

  return [
    {
      label: "مخزن مقالات (Repository)",
      status: isProduction && sanityReadReady ? "connected" : "not_configured",
      detail: isProduction ? (sanityReadReady ? "Sanity (Cached)" : "Sanity پیکربندی نشده") : "Memory (فقط محیط توسعه)",
    },
    {
      label: "Sanity — خواندن (Read)",
      status: sanityReadReady ? "connected" : "not_configured",
      detail: sanityReadReady
        ? "پیکربندی شده"
        : "NEXT_PUBLIC_SANITY_PROJECT_ID یا NEXT_PUBLIC_SANITY_DATASET تنظیم نشده",
    },
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
    {
      label: "Google Analytics 4",
      status: "not_configured",
      detail: "متصل نشده",
    },
    {
      label: "Google Search Console",
      status: "not_configured",
      detail: "متصل نشده",
    },
    {
      label: "Microsoft Clarity",
      status: "not_configured",
      detail: "متصل نشده",
    },
  ];
}
