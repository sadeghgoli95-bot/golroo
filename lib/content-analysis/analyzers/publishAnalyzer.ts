import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

type ChecklistItem = { label: string; passed: boolean };

/**
 * `internalLinkSuggestionCount` is optional and, when omitted, the
 * internal-link checklist item is skipped entirely rather than scored as
 * failed — this function only ever receives a single article and can't
 * compute real internal-link opportunities without the corpus (see
 * lib/content-analysis/analyzers/internalLinkAnalyzer.ts), so it used to
 * check the always-hardcoded-0 article.internalLinkCount field, which
 * failed this item for every article regardless of reality. A missing
 * featured image is never counted against this checklist either —
 * image selection is a manual Sanity Studio step, not an import-time
 * requirement (see lib/content-analysis/analyzers/imageAnalyzer.ts for
 * the same rule already applied to the SEO score).
 */
export function analyzePublishReadiness(
  article: AnalyzableArticle,
  internalLinkSuggestionCount?: number
): AnalyzerResult {
  const warnings: string[] = [];

  const checklist: ChecklistItem[] = [
    { label: "عنوان", passed: Boolean(article.title) },
    { label: "Meta", passed: Boolean(article.metaDescription) },
    { label: "Slug", passed: Boolean(article.slug) },
    { label: "Keywords", passed: article.keywords.length > 0 },
    { label: "بدنه", passed: Boolean(article.body) },
    { label: "منابع", passed: article.sources.length > 0 },
    { label: "FAQ", passed: article.hasFaq },
    { label: "Schema", passed: article.hasSchema },
    { label: "Canonical", passed: article.hasCanonical },
    ...(article.hasFeaturedImage
      ? [
          {
            label: "Alt Text",
            passed: article.imageAltTexts.length > 0 && article.imageAltTexts.every((alt) => alt.trim().length > 0),
          },
        ]
      : []),
    ...(internalLinkSuggestionCount !== undefined
      ? [{ label: "لینک داخلی", passed: internalLinkSuggestionCount > 0 }]
      : []),
  ];

  for (const item of checklist) {
    if (!item.passed) warnings.push(`${item.label} تکمیل نشده است`);
  }

  const passed = checklist.filter((item) => item.passed).length;

  return { score: ratioScore(passed, checklist.length), warnings, suggestions: [] };
}
