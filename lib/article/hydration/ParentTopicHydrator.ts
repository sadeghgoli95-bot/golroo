import type { Hydrator } from "./types";

/** No-op by design — see EntityHydrator's comment; Sanity's `topic` is a flat string with no hierarchy field yet. */
export const ParentTopicHydrator: Hydrator = (article) => {
  if (article.parentTopic !== null) return { article, warnings: [] };
  return { article, warnings: ["ParentTopic تعیین نشده — ساختار سلسله‌مراتبی موضوعات هنوز در Sanity وجود ندارد"] };
};
