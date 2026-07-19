import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MAX_AVERAGE_SENTENCE_WORDS, ratioScore } from "../constants";

const SENTENCE_SPLIT_PATTERN = /[.!؟?]+/;

function averageSentenceLength(body: string): number {
  const sentences = body
    .split(SENTENCE_SPLIT_PATTERN)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length === 0) return 0;

  const totalWords = sentences.reduce(
    (sum, sentence) => sum + sentence.split(/\s+/).filter(Boolean).length,
    0
  );
  return totalWords / sentences.length;
}

export function analyzeReadability(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasBody = Boolean(article.body);
  if (!hasBody) warnings.push("بدنه مقاله وجود ندارد");

  const avgSentenceLength = hasBody ? averageSentenceLength(article.body!) : 0;
  const shortSentences = hasBody && avgSentenceLength > 0 && avgSentenceLength <= MAX_AVERAGE_SENTENCE_WORDS;
  if (hasBody && !shortSentences) {
    suggestions.push(`میانگین طول جمله بیشتر از ${MAX_AVERAGE_SENTENCE_WORDS} کلمه است`);
  }

  const checks = [hasBody, shortSentences];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
