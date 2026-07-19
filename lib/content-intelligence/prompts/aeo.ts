import type { AnalyzableArticleForAI } from "../types";

export function buildAeoPrompt(article: AnalyzableArticleForAI): string {
  return [
    "به عنوان متخصص AEO (بهینه‌سازی برای موتورهای پاسخ)، مقاله زیر را بررسی کن.",
    "برای Answer Box، Featured Snippet، FAQ، Definition Box، جدول مقایسه، مراحل گام‌به‌گام و People Also Also Ask پیشنهاد بده.",
    `عنوان: ${article.title ?? "-"}`,
    `نکات مهم: ${article.importantPoints.join(" / ") || "-"}`,
    `پرسش پایانی: ${article.finalQuestion ?? "-"}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
