import type { ValidationIssue, ValidationReport } from "./types";
import type { ParsedArticleFields } from "../content-import/types";
import type { AnalyzableArticle, LinkableArticleSummary } from "../content-analysis/types";
import { analyzeDuplicateContent } from "../content-analysis/analyzers/duplicateAnalyzer";

function issuesFromParserWarnings(parsed: ParsedArticleFields): ValidationIssue[] {
  return parsed.warnings.map((message) => ({ code: "parser_warning", message }));
}

function issuesFromCorpusDuplicates(
  article: AnalyzableArticle,
  candidates: LinkableArticleSummary[]
): ValidationIssue[] {
  const duplicates = analyzeDuplicateContent(article, candidates);
  return duplicates
    .filter((match) => match.matchType === "slug" || match.matchType === "title")
    .map((match) => ({
      code: match.matchType === "slug" ? "duplicate_slug" : "duplicate_title",
      message: `${match.matchType === "slug" ? "Slug" : "Title"} تکراری با «${match.targetTitle}»`,
    }));
}

function issuesFromInternalSourceDuplicates(article: AnalyzableArticle): ValidationIssue[] {
  const seenDois = new Set<string>();
  const issues: ValidationIssue[] = [];

  for (const source of article.sources) {
    if (!source.doi) continue;
    if (seenDois.has(source.doi)) {
      issues.push({ code: "duplicate_source", message: `منبع تکراری با DOI ${source.doi}` });
    }
    seenDois.add(source.doi);
  }

  return issues;
}

function issuesFromMissingFields(article: AnalyzableArticle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!article.metaDescription) issues.push({ code: "missing_meta", message: "Meta Description وجود ندارد" });
  if (!article.focusKeyword) issues.push({ code: "missing_focus_keyword", message: "Focus Keyword وجود ندارد" });
  if (!article.excerpt) issues.push({ code: "missing_summary", message: "خلاصه وجود ندارد" });
  if (article.sources.length === 0) issues.push({ code: "missing_references", message: "منبعی ثبت نشده است" });

  return issues;
}

/** Every validation this project runs, in one place — parser warnings, duplicate checks, and missing-field checks. */
export function runValidationEngine(
  parsed: ParsedArticleFields,
  article: AnalyzableArticle,
  candidates: LinkableArticleSummary[]
): ValidationReport {
  const issues = [
    ...issuesFromParserWarnings(parsed),
    ...issuesFromCorpusDuplicates(article, candidates),
    ...issuesFromInternalSourceDuplicates(article),
    ...issuesFromMissingFields(article),
  ];

  return { passed: issues.length === 0, issues };
}
