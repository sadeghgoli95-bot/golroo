import type { AIProvider, AnalyzableArticleForAI, OptimizerResult } from "../types";
import {
  createNotConfiguredOptimizerResult,
  buildSingleUserMessageRequest,
  MIN_SLUG_ALTERNATIVES,
} from "../constants";

export async function optimizeSlug(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<OptimizerResult> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredOptimizerResult();
  }

  const prompt = [
    `حداقل ${MIN_SLUG_ALTERNATIVES} Slug جایگزین (فقط a-z, 0-9, -) برای مقاله زیر پیشنهاد بده.`,
    `عنوان: ${article.title ?? "-"}`,
    `Slug فعلی: ${article.slug ?? "-"}`,
  ].join("\n\n");

  const completion = await provider.complete(buildSingleUserMessageRequest(prompt));

  return {
    status: "ready",
    alternatives: [{ value: completion.content, seoScore: null, aeoScore: null, ctrEstimate: null }],
  };
}
