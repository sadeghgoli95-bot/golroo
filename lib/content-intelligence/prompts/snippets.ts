import type { AnalyzableArticleForAI } from "../types";

export function buildSnippetsPrompt(article: AnalyzableArticleForAI): string {
  return [
    "بر اساس مقاله زیر پیشنهاد بده: Featured Snippet، Definition Snippet، List Snippet، Table Snippet.",
    `عنوان: ${article.title ?? "-"}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
