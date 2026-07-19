import type { AnalyzableArticleForAI } from "../types";

export function buildSeoPrompt(article: AnalyzableArticleForAI): string {
  return [
    "به عنوان یک متخصص سئو، مقاله زیر را بررسی کن.",
    "برای Title، Meta، Slug، ساختار Heading، لینک‌سازی داخلی و خارجی، Alt تصاویر، جایگذاری و تراکم کلیدواژه پیشنهاد بده.",
    `عنوان: ${article.title ?? "-"}`,
    `Slug: ${article.slug ?? "-"}`,
    `توضیحات متا: ${article.metaDescription ?? "-"}`,
    `کلیدواژه‌ها: ${article.keywords.join("، ") || "-"}`,
    `تعداد تیتر: ${article.headingCount}`,
    `لینک داخلی: ${article.internalLinkCount} | لینک خارجی: ${article.externalLinkCount}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
