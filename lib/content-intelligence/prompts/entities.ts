import type { AnalyzableArticleForAI } from "../types";

export function buildEntitiesPrompt(article: AnalyzableArticleForAI): string {
  return [
    "موجودیت‌های موجود در متن زیر را استخراج کن: افراد، اختلال‌ها، بیماری‌ها، داروها، روش‌های درمان، نظریه‌ها، کتاب‌ها، کشورها، سن، گروه‌های سنی، مفاهیم روان‌شناسی.",
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
