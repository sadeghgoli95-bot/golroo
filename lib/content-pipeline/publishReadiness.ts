import type { Article } from "@/lib/article/types";
import type { CategoryScores, DuplicateMatch } from "@/lib/content-analysis/types";
import type { ValidationReport } from "./types";
import {
  READY_MIN_SEO_SCORE,
  READY_MIN_AEO_SCORE,
  READY_MIN_GEO_SCORE,
  ALMOST_READY_MIN_SEO_SCORE,
  ALMOST_READY_MIN_AEO_SCORE,
  ALMOST_READY_MIN_GEO_SCORE,
  BLOCKING_DUPLICATE_MATCH_TYPES,
} from "./publishReadinessConstants";

export type PublishReadinessStatus = "ready" | "almost_ready" | "blocked";

export type PublishReadinessResult = {
  status: PublishReadinessStatus;
  reasons: string[];
};

/**
 * Combines every already-computed signal (validation, SEO/AEO/GEO scores,
 * duplicate matches) into one status — it runs no analysis itself. AI
 * confidence is intentionally NOT a blocking factor: an unconfigured
 * AIProvider (confidence 0) must never prevent publishing content that's
 * otherwise sound, per this project's Mock-Free/no-AI-dependency rule.
 */
export function derivePublishReadiness(
  article: Article,
  validation: ValidationReport,
  scores: Pick<CategoryScores, "seo" | "aeo" | "geo">,
  duplicates: DuplicateMatch[]
): PublishReadinessResult {
  const reasons: string[] = [];

  if (!article.title) reasons.push("عنوان وجود ندارد");
  if (!article.slug) reasons.push("slug وجود ندارد");
  if (!article.body) reasons.push("متن مقاله وجود ندارد");

  for (const issue of validation.issues) {
    reasons.push(issue.message);
  }

  const blockingDuplicates = duplicates.filter((match) =>
    BLOCKING_DUPLICATE_MATCH_TYPES.includes(match.matchType as (typeof BLOCKING_DUPLICATE_MATCH_TYPES)[number])
  );
  for (const match of blockingDuplicates) {
    reasons.push(`تکراری با «${match.targetTitle}» (${match.matchType})`);
  }

  const hasBlockingIssue = !article.title || !article.slug || !article.body || blockingDuplicates.length > 0;
  if (hasBlockingIssue) {
    return { status: "blocked", reasons };
  }

  const meetsReadyThreshold =
    validation.passed &&
    scores.seo >= READY_MIN_SEO_SCORE &&
    scores.aeo >= READY_MIN_AEO_SCORE &&
    scores.geo >= READY_MIN_GEO_SCORE;

  if (meetsReadyThreshold) {
    return { status: "ready", reasons: [] };
  }

  const meetsAlmostReadyThreshold =
    scores.seo >= ALMOST_READY_MIN_SEO_SCORE &&
    scores.aeo >= ALMOST_READY_MIN_AEO_SCORE &&
    scores.geo >= ALMOST_READY_MIN_GEO_SCORE;

  if (!meetsAlmostReadyThreshold) {
    reasons.push("امتیاز SEO/AEO/GEO به‌طور قابل‌توجهی پایین است");
    return { status: "blocked", reasons };
  }

  if (scores.seo < READY_MIN_SEO_SCORE) reasons.push(`امتیاز SEO (${scores.seo}) کمتر از حد آماده انتشار است`);
  if (scores.aeo < READY_MIN_AEO_SCORE) reasons.push(`امتیاز AEO (${scores.aeo}) کمتر از حد آماده انتشار است`);
  if (scores.geo < READY_MIN_GEO_SCORE) reasons.push(`امتیاز GEO (${scores.geo}) کمتر از حد آماده انتشار است`);

  return { status: "almost_ready", reasons };
}
