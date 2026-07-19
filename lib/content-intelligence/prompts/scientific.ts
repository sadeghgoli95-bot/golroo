import type { AnalyzableArticleForAI } from "../types";

export function buildScientificPrompt(article: AnalyzableArticleForAI): string {
  const sourceLines = article.sources
    .map((source) => `${source.author ?? "؟"} (${source.year ?? "؟"}) DOI: ${source.doi ?? "ندارد"}`)
    .join("\n");

  return [
    "به عنوان ویراستار علمی، قدرت منابع، تعداد منابع، وجود DOI، قدیمی بودن منابع و ادعاهای بدون منبع در مقاله زیر را بررسی کن.",
    `منابع:\n${sourceLines || "-"}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
