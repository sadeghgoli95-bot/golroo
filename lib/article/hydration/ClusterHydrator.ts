import type { Hydrator } from "./types";

/** No-op by design — see EntityHydrator's comment; no clustering engine exists yet. */
export const ClusterHydrator: Hydrator = (article) => {
  if (article.clusterId !== null) return { article, warnings: [] };
  return { article, warnings: ["ClusterId تعیین نشده — موتور خوشه‌بندی موضوعی هنوز پیاده‌سازی نشده است"] };
};
