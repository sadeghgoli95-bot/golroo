import type { AnalyzableArticle, ContentAnalysisReport, LinkableArticleSummary } from "./types";
import { calculateSEOScore } from "./scoring/calculateSEOScore";
import { calculateAEOScore } from "./scoring/calculateAEOScore";
import { calculateGEOScore } from "./scoring/calculateGEOScore";
import { calculateContentScore } from "./scoring/calculateContentScore";
import { calculateSiteReadiness } from "./scoring/calculateSiteReadiness";
import { analyzeInternalLinking } from "./analyzers/internalLinkAnalyzer";

/**
 * `candidates` is optional — when given (the real corpus, excluding this
 * article), publish-readiness scores real internal-link opportunities
 * via analyzeInternalLinking; when omitted, that one checklist item is
 * skipped rather than scored as a fabricated failure (see
 * publishAnalyzer.ts).
 */
export function analyzeArticle(
  article: AnalyzableArticle,
  candidates?: LinkableArticleSummary[]
): ContentAnalysisReport {
  const seo = calculateSEOScore(article);
  const aeo = calculateAEOScore(article);
  const geo = calculateGEOScore(article);
  const content = calculateContentScore(article);
  const internalLinkSuggestionCount = candidates ? analyzeInternalLinking(article, candidates).length : undefined;
  const publishReady = calculateSiteReadiness(article, internalLinkSuggestionCount);

  return {
    scores: {
      seo: seo.score,
      aeo: aeo.score,
      geo: geo.score,
      content: content.score,
      publishReady: publishReady.score,
    },
    warnings: [...seo.warnings, ...aeo.warnings, ...geo.warnings, ...content.warnings, ...publishReady.warnings],
    suggestions: [
      ...seo.suggestions,
      ...aeo.suggestions,
      ...geo.suggestions,
      ...content.suggestions,
      ...publishReady.suggestions,
    ],
    statistics: {
      wordCount: article.wordCount,
      sourceCount: article.sources.length,
      internalLinkCount: internalLinkSuggestionCount ?? 0,
      externalLinkCount: article.externalLinkCount,
      headingCount: article.headingCount,
    },
  };
}
