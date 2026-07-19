import type { AnalyzableArticleForAI } from "../types";
import { MAX_FAQ_SUGGESTIONS } from "../constants";

export function buildFaqPrompt(article: AnalyzableArticleForAI): string {
  return [
    `اگر این مقاله ظرفیت FAQ دارد، حداکثر ${MAX_FAQ_SUGGESTIONS} سؤال و پاسخ پیشنهادی تولید کن.`,
    `عنوان: ${article.title ?? "-"}`,
    `بدنه: ${article.body ?? "-"}`,
  ].join("\n\n");
}
