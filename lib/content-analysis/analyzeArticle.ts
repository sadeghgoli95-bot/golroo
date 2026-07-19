import type { AnalyzableArticle, ContentAnalysisReport } from "./types";
import { calculateSEOScore } from "./scoring/calculateSEOScore";
import { calculateAEOScore } from "./scoring/calculateAEOScore";
import { calculateGEOScore } from "./scoring/calculateGEOScore";
import { calculateContentScore } from "./scoring/calculateContentScore";
import { calculateSiteReadiness } from "./scoring/calculateSiteReadiness";

export function analyzeArticle(article: AnalyzableArticle): ContentAnalysisReport {
  const seo = calculateSEOScore(article);
  const aeo = calculateAEOScore(article);
  const geo = calculateGEOScore(article);
  const content = calculateContentScore(article);
  const publishReady = calculateSiteReadiness(article);

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
      wordCount: article.body ? article.body.split(/\s+/).filter(Boolean).length : 0,
      sourceCount: article.sources.length,
      internalLinkCount: article.internalLinkCount,
      externalLinkCount: article.externalLinkCount,
      importantPointCount: article.importantPoints.length,
    },
  };
}
