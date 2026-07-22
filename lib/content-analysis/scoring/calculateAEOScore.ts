import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { detectFeaturedSnippetCandidates } from "../analyzers/featuredSnippetAnalyzer";

const QUESTION_ENDING_PATTERN = /[؟?]\s*$/;
const MAX_CONCISE_ANSWER_WORDS = 60;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Rewritten to score against the current Markdown import format's real
 * fields (headings, faq, body) instead of the legacy Mirora sections
 * (finalQuestion, importantPoints), which are always empty for every
 * article the current parser produces — the previous version of this
 * function always scored those two checks as failed for every fresh
 * import, a real bug (see lib/content-import for the format change).
 */
export function calculateAEOScore(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];
  const snippetCandidates = detectFeaturedSnippetCandidates(article);

  const hasQuestionHeadings = article.headings.some((heading) => QUESTION_ENDING_PATTERN.test(heading.text.trim()));
  if (!hasQuestionHeadings) {
    suggestions.push("افزودن تیترهای پرسشی (مثلاً «... چیست؟») به پوشش AEO کمک می‌کند");
  }

  const hasFaqOpportunity = article.hasFaq;
  if (!hasFaqOpportunity) suggestions.push("افزودن بخش سوالات متداول پیشنهاد می‌شود");

  const hasSnippetOpportunity = snippetCandidates.length > 0;
  if (!hasSnippetOpportunity) {
    suggestions.push("پاسخ مستقیم و کوتاه بلافاصله بعد از تیترهای پرسشی برای Featured Snippet پیشنهاد می‌شود");
  }

  const hasConciseAnswers = snippetCandidates.some((candidate) => wordCount(candidate.answer) <= MAX_CONCISE_ANSWER_WORDS);
  if (hasSnippetOpportunity && !hasConciseAnswers) {
    suggestions.push(`پاسخ‌ها را برای Featured Snippet کوتاه‌تر کنید (حداکثر ${MAX_CONCISE_ANSWER_WORDS} کلمه)`);
  }

  const checks = [hasQuestionHeadings, hasFaqOpportunity, hasSnippetOpportunity, hasConciseAnswers];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
