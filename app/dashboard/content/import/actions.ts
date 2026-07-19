"use server";

import { runContentPipeline, type PipelineResult } from "@/lib/content-pipeline/runContentPipeline";
import { createArticleRepository } from "@/lib/article/repositories";
import { RepositoryError } from "@/lib/article/errors";

export type AnalyzeActionResult = { ok: true; result: PipelineResult } | { ok: false; message: string };

/** The only place the Import page reaches into the pipeline — never called from a client component directly, only via a form action. */
export async function analyzeArticleAction(rawText: string): Promise<AnalyzeActionResult> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { ok: false, message: "متن مقاله خالی است." };
  }

  try {
    const repository = createArticleRepository();
    const result = await runContentPipeline(trimmed, repository, null);
    return { ok: true, result };
  } catch (error) {
    const message = error instanceof RepositoryError ? error.message : "تحلیل مقاله با خطا مواجه شد.";
    return { ok: false, message };
  }
}

export type SaveDraftActionResult = { ok: true; slug: string } | { ok: false; message: string };

/** Called only after human approval in the UI — never automatically. */
export async function saveDraftAction(articleJson: string): Promise<SaveDraftActionResult> {
  try {
    const article = JSON.parse(articleJson) as Parameters<
      ReturnType<typeof createArticleRepository>["createDraft"]
    >[0];
    const repository = createArticleRepository();
    const { slug } = await repository.createDraft(article);
    return { ok: true, slug };
  } catch (error) {
    const message = error instanceof RepositoryError || error instanceof Error ? error.message : "ذخیره پیش‌نویس با خطا مواجه شد.";
    return { ok: false, message };
  }
}
