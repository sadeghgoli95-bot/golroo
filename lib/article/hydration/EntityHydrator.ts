import type { Hydrator } from "./types";

/**
 * No-op by design: Sanity has no entity field yet (see
 * lib/article/mappers/fromSanity.ts) and no entity-extraction engine
 * exists in this codebase. Fabricating entities here would violate the
 * project's Mock-Free rule, so this hydrator only surfaces the gap as a
 * warning instead of inventing data.
 */
export const EntityHydrator: Hydrator = (article) => {
  if (article.entities.length > 0) return { article, warnings: [] };
  return { article, warnings: ["Entities استخراج نشده — موتور استخراج موجودیت هنوز پیاده‌سازی نشده است"] };
};
