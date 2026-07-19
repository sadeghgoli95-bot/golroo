import type { AnalyzableArticleForAI } from "../types";

export function buildClustersPrompt(article: AnalyzableArticleForAI): string {
  return [
    "تشخیص بده این مقاله متعلق به کدام خوشه موضوعی (Topic Cluster) است.",
    "اگر خوشه ناقص است، عنوان یک مقاله جدید برای تکمیل آن پیشنهاد بده.",
    `عنوان: ${article.title ?? "-"}`,
    `کلیدواژه‌ها: ${article.keywords.join("، ") || "-"}`,
  ].join("\n\n");
}
