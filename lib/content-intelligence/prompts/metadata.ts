import type { AnalyzableArticleForAI } from "../types";

export function buildMetadataPrompt(article: AnalyzableArticleForAI): string {
  return [
    "متادیتای مقاله زیر (Canonical، OpenGraph، Twitter Card) را بررسی کن و مشکلات را مشخص کن.",
    `Canonical موجود: ${article.hasCanonical ? "بله" : "خیر"}`,
    `OpenGraph موجود: ${article.hasOpenGraph ? "بله" : "خیر"}`,
    `Twitter Card موجود: ${article.hasTwitterCard ? "بله" : "خیر"}`,
  ].join("\n\n");
}
