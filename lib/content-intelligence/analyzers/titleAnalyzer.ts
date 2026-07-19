import type { AIProvider, AnalyzableArticleForAI, OptimizerResult } from "../types";
import {
  createNotConfiguredOptimizerResult,
  buildSingleUserMessageRequest,
  MIN_TITLE_ALTERNATIVES,
} from "../constants";

export async function optimizeTitle(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<OptimizerResult> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredOptimizerResult();
  }

  const prompt = [
    `حداقل ${MIN_TITLE_ALTERNATIVES} عنوان جایگزین برای مقاله زیر پیشنهاد بده.`,
    "برای هر عنوان یک SEO Score، AEO Score و تخمین نرخ کلیک (CTR) بین ۰ تا ۱۰۰ بده.",
    `عنوان فعلی: ${article.title ?? "-"}`,
    `کلیدواژه‌ها: ${article.keywords.join("، ") || "-"}`,
  ].join("\n\n");

  const completion = await provider.complete(buildSingleUserMessageRequest(prompt));

  return {
    status: "ready",
    alternatives: [{ value: completion.content, seoScore: null, aeoScore: null, ctrEstimate: null }],
  };
}
