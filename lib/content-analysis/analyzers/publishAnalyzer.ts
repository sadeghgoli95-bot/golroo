import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_INTERNAL_LINKS, ratioScore } from "../constants";

type ChecklistItem = { label: string; passed: boolean };

export function analyzePublishReadiness(article: AnalyzableArticle): AnalyzerResult {
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
    { label: "لینک داخلی", passed: article.internalLinkCount >= MIN_INTERNAL_LINKS },
    { label: "تصویر", passed: article.hasFeaturedImage },
    {
      label: "Alt Text",
      passed: article.imageAltTexts.length > 0 && article.imageAltTexts.every((alt) => alt.trim().length > 0),
    },
    { label: "Canonical", passed: article.hasCanonical },
  ];

  for (const item of checklist) {
    if (!item.passed) warnings.push(`${item.label} تکمیل نشده است`);
  }

  const passed = checklist.filter((item) => item.passed).length;

  return { score: ratioScore(passed, checklist.length), warnings, suggestions: [] };
}
