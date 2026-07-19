import type { AnalyzableArticleForAI } from "../types";

export function buildReadabilityPrompt(article: AnalyzableArticleForAI): string {
  return [
    "به عنوان ویراستار، خوانایی متن زیر را از نظر پیچیدگی، طول جمله، طول پاراگراف، کلمات تکراری، ابهام و روانی متن بررسی کن.",
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
