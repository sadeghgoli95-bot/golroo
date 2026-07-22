import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { foldPersianText } from "@/lib/utils/textNormalize";

const MIN_COVERAGE_RATIO = 0.3;

/**
 * Structural proxy for topic coverage: what share of the article's
 * headings actually relate (via a folded substring match) to the Focus
 * Keyword/Topic/Secondary Keywords. Not true semantic/embedding-based
 * coverage — this project has no embedding model — but a real,
 * deterministic signal rather than a fabricated similarity score.
 */
export function analyzeTopicCoverage(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (article.headings.length === 0) {
    return { score: 0, warnings: ["ساختار تیتر برای بررسی پوشش موضوعی وجود ندارد"], suggestions };
  }

  const topicTerms = [article.focusKeyword, article.topic, ...article.secondaryKeywords]
    .filter((term): term is string => Boolean(term))
    .flatMap((term) => foldPersianText(term).split(" "))
    .filter((word) => word.length > 1);

  if (topicTerms.length === 0) {
    return { score: 0, warnings: ["کلیدواژه یا موضوعی برای بررسی پوشش موضوعی وجود ندارد"], suggestions };
  }

  const coveredHeadings = article.headings.filter((heading) => {
    const foldedHeading = foldPersianText(heading.text);
    return topicTerms.some((term) => foldedHeading.includes(term));
  });

  if (coveredHeadings.length / article.headings.length < MIN_COVERAGE_RATIO) {
    suggestions.push("بیشتر تیترها به کلیدواژه یا موضوع اصلی مرتبط نیستند — پوشش موضوعی را افزایش دهید");
  }

  return { score: ratioScore(coveredHeadings.length, article.headings.length), warnings, suggestions };
}
