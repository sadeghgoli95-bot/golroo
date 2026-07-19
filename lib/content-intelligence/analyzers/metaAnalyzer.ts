import type { AIProvider, AnalyzableArticleForAI, OptimizerResult } from "../types";
import {
  createNotConfiguredOptimizerResult,
  buildSingleUserMessageRequest,
  MIN_META_ALTERNATIVES,
} from "../constants";

export async function optimizeMetaDescription(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<OptimizerResult> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredOptimizerResult();
  }

  const prompt = [
    `حداقل ${MIN_META_ALTERNATIVES} توضیحات متا جایگزین (هرکدام بین ۷۰ تا ۱۶۰ کاراکتر) برای مقاله زیر پیشنهاد بده.`,
    `عنوان: ${article.title ?? "-"}`,
    `توضیحات متا فعلی: ${article.metaDescription ?? "-"}`,
  ].join("\n\n");

  const completion = await provider.complete(buildSingleUserMessageRequest(prompt));

  return {
    status: "ready",
    alternatives: [{ value: completion.content, seoScore: null, aeoScore: null, ctrEstimate: null }],
  };
}
