import type { Hydrator } from "./types";

/**
 * No-op by design: `hasSchema` from fromSanity.ts is always false because
 * Sanity has no structured-data signal to read — this is "unknown", not
 * a verified false, until a schema-generation/detection engine exists.
 */
export const SchemaHydrator: Hydrator = (article) => {
  if (article.hasSchema) return { article, warnings: [] };
  return { article, warnings: ["وضعیت Schema.org قابل تشخیص نیست — موتور تولید/تشخیص Schema هنوز وجود ندارد"] };
};
