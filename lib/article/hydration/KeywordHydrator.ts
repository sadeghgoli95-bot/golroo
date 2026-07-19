import type { Hydrator } from "./types";

/**
 * Real fallback, not fabrication: if the CMS has no SEO keywords set,
 * reuse the article's own editorial tags as keyword candidates — they're
 * already human-authored signal, unlike an invented keyword would be.
 * True keyword extraction (frequency/entity-based) is Content Import
 * Engine scope, not this repository layer's.
 */
export const KeywordHydrator: Hydrator = (article) => {
  if (article.keywords.length > 0) return { article, warnings: [] };
  if (article.tags.length === 0) {
    return { article, warnings: ["Keywords و Tags هر دو خالی‌اند — نمی‌توان کلیدواژه استنتاج کرد"] };
  }

  return {
    article: { ...article, keywords: [...article.tags] },
    warnings: ["Keywords خالی بود؛ به‌صورت موقت از Tags استفاده شد"],
  };
};
