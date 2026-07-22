import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { analyzeScientificTrust } from "../analyzers/scientificAnalyzer";
import { analyzeSourceAuthority } from "../analyzers/sourceAuthorityAnalyzer";

const PASSING_SCIENTIFIC_SCORE = 50;
const PASSING_AUTHORITY_SCORE = 50;

export function calculateGEOScore(article: AnalyzableArticle): AnalyzerResult {
  const scientific = analyzeScientificTrust(article);
  const authority = analyzeSourceAuthority(article);
  const warnings = [...scientific.warnings, ...authority.warnings];
  const suggestions = [...scientific.suggestions, ...authority.suggestions];

  const hasAuthorAttribution = Boolean(article.authorName);
  if (!hasAuthorAttribution) warnings.push("نام نویسنده ثبت نشده است");

  // Evidence density relative to article structure — one source per two
  // sections is a reasonable grounding baseline for GEO. Replaces a
  // previous comparison against article.importantPoints.length, a
  // legacy field that's always empty for the current import format (see
  // lib/article/types.ts), which made this check trivially always pass.
  const expectedSources = Math.max(1, Math.ceil(article.headingCount / 2));
  const hasEvidenceDensity = article.sources.length >= expectedSources;
  if (!hasEvidenceDensity) suggestions.push("تراکم شواهد نسبت به ساختار مقاله کم است — منابع بیشتری اضافه کنید");

  const checks = [
    scientific.score >= PASSING_SCIENTIFIC_SCORE,
    authority.score >= PASSING_AUTHORITY_SCORE,
    hasAuthorAttribution,
    hasEvidenceDensity,
  ];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
