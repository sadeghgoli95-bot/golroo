import type { AnalyzableArticleForAI } from "../types";

export function buildLinkingPrompt(article: AnalyzableArticleForAI): string {
  return [
    "بر اساس عنوان، موضوع و کلیدواژه‌های مقاله زیر، پیشنهاد بده چه مقاله‌هایی باید به این مقاله لینک بدهند و این مقاله باید به کجا لینک بدهد.",
    "هیچ لینکی را خودت ثبت نکن، فقط پیشنهاد بده.",
    `عنوان: ${article.title ?? "-"}`,
    `کلیدواژه‌ها: ${article.keywords.join("، ") || "-"}`,
  ].join("\n\n");
}
