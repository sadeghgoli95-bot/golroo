import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { detectFeaturedSnippetCandidates } from "./featuredSnippetAnalyzer";

const MAX_CONCISE_ANSWER_WORDS = 50;

/** Reuses featuredSnippetAnalyzer's real candidate extraction rather than re-deriving answer text. */
export function analyzeVoiceSearchReadiness(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];

  const hasSpeakableContent = Boolean(article.excerpt);
  if (!hasSpeakableContent) suggestions.push("خلاصه‌ای کوتاه برای پاسخ‌گویی به دستیارهای صوتی وجود ندارد");

  const candidates = detectFeaturedSnippetCandidates(article);
  const hasConciseAnswer = candidates.some(
    (candidate) => candidate.answer.split(/\s+/).filter(Boolean).length <= MAX_CONCISE_ANSWER_WORDS
  );
  if (!hasConciseAnswer) {
    suggestions.push(`پاسخ کوتاه و مستقیم (حداکثر ${MAX_CONCISE_ANSWER_WORDS} کلمه) برای جستجوی صوتی پیشنهاد می‌شود`);
  }

  const hasFaqForVoice = article.hasFaq;
  if (!hasFaqForVoice) suggestions.push("افزودن FAQ به آمادگی برای جستجوی صوتی کمک می‌کند");

  const checks = [hasSpeakableContent, hasConciseAnswer, hasFaqForVoice];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
