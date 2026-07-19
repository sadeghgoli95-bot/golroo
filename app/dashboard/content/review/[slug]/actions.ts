"use server";

import { createArticleRepository } from "@/lib/article/repositories";
import { RepositoryError } from "@/lib/article/errors";
import type { Article } from "@/lib/article/types";
import { analyzeExistingArticle, type ReviewAnalysis } from "./reviewAnalysis";

export type EditableFields = {
  title: string;
  slug: string;
  excerpt: string;
  metaDescription: string;
  keywords: string;
  body: string;
};

export type SaveEditsResult =
  | { ok: true; article: Article; analysis: ReviewAnalysis }
  | { ok: false; message: string };

/** Re-analyzes on every save and persists through Repository.updateDraft — never bypasses it. */
export async function saveEditsAction(currentSlug: string, fields: EditableFields): Promise<SaveEditsResult> {
  try {
    const repository = createArticleRepository();
    const existing = await repository.findBySlug(currentSlug);
    if (!existing) return { ok: false, message: "مقاله یافت نشد." };

    const edited: Article = {
      ...existing,
      title: fields.title.trim() || null,
      slug: fields.slug.trim() || null,
      excerpt: fields.excerpt.trim() || null,
      metaDescription: fields.metaDescription.trim() || null,
      keywords: fields.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      body: fields.body.trim() || null,
    };

    const candidates = (await repository.listAll()).filter((summary) => summary.slug !== currentSlug);
    const analysis = analyzeExistingArticle(edited, candidates);

    await repository.updateDraft(currentSlug, edited);

    return { ok: true, article: edited, analysis };
  } catch (error) {
    const message =
      error instanceof RepositoryError || error instanceof Error ? error.message : "ذخیره ویرایش با خطا مواجه شد.";
    return { ok: false, message };
  }
}

export type ReviewDecisionType = "approve" | "reject" | "request_changes";

export type ReviewDecisionResult =
  | { ok: true; decision: ReviewDecisionType; at: string; note: string | null; readiness: ReviewAnalysis["publishReadiness"] }
  | { ok: false; message: string };

/**
 * Returns a typed decision but does NOT persist it — the canonical
 * Article model has no review-state field, and adding one would be a
 * domain-model change this task is explicitly scoped not to make. An
 * "approve" is refused (typed failure, not a silent no-op) whenever
 * publishReadiness is "blocked".
 */
export async function reviewDecisionAction(
  slug: string,
  decision: ReviewDecisionType,
  note: string
): Promise<ReviewDecisionResult> {
  try {
    const repository = createArticleRepository();
    const article = await repository.findBySlug(slug);
    if (!article) return { ok: false, message: "مقاله یافت نشد." };

    const candidates = (await repository.listAll()).filter((summary) => summary.slug !== slug);
    const analysis = analyzeExistingArticle(article, candidates);

    if (decision === "approve" && analysis.publishReadiness.status === "blocked") {
      return { ok: false, message: `تأیید ممکن نیست: ${analysis.publishReadiness.reasons.join("، ")}` };
    }

    return {
      ok: true,
      decision,
      at: new Date().toISOString(),
      note: note.trim() || null,
      readiness: analysis.publishReadiness,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ثبت تصمیم با خطا مواجه شد.";
    return { ok: false, message };
  }
}
