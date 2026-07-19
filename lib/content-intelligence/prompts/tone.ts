import type { AnalyzableArticleForAI } from "../types";

export function buildTonePrompt(article: AnalyzableArticleForAI): string {
  return [
    "لحن متن زیر را از نظر یکدستی، مناسب بودن برای مخاطب و همخوانی با هویت بالینی گل‌رو بررسی کن.",
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
