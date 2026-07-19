import type { AnalyzableArticleForAI } from "../types";

export function buildGeoPrompt(article: AnalyzableArticleForAI): string {
  const sourceLines = article.sources
    .map((source) => `${source.author ?? "؟"} (${source.year ?? "؟"}) DOI: ${source.doi ?? "ندارد"}`)
    .join("\n");

  return [
    "به عنوان متخصص GEO (بهینه‌سازی برای موتورهای هوش مصنوعی)، مقاله زیر را از نظر کیفیت استناد، شواهد، پوشش موجودیت‌ها، کامل بودن موضوع، پشتیبانی ادعاها و نشانه‌های اعتماد بررسی کن.",
    "احتمال استناد موتورهای هوش مصنوعی (AI Citation Probability) را تخمین بزن.",
    `عنوان: ${article.title ?? "-"}`,
    `منابع:\n${sourceLines || "-"}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
