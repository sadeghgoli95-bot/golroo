import type { ArticleRepository } from "@/lib/article/repository";
import { calculateDetailedScores } from "@/lib/content-analysis/scoring/calculateDetailedScores";
import type { OverviewScores } from "./types";

const NEUTRAL_SCORE = 0;

function average(values: number[]): number {
  if (values.length === 0) return NEUTRAL_SCORE;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/**
 * `performance` and `visibility` stay 0 — no analytics or AI provider is
 * connected yet, and an unmeasured dimension must never get a fabricated
 * score. Every other field is a real average of calculateDetailedScores
 * across every article the repository returns (0 when the corpus is
 * empty, not NaN).
 */
export async function getOverviewScores(repository: ArticleRepository): Promise<OverviewScores> {
  const summaries = await repository.listAll();
  const articles = await Promise.all(
    summaries
      .filter((summary): summary is typeof summary & { slug: string } => summary.slug !== null)
      .map((summary) => repository.findBySlug(summary.slug))
  );

  const detailedScores = articles
    .filter((article): article is NonNullable<typeof article> => article !== null)
    .map(calculateDetailedScores);

  return {
    siteHealth: average(detailedScores.map((scores) => scores.overall)),
    seo: average(detailedScores.map((scores) => scores.seo)),
    aeo: average(detailedScores.map((scores) => scores.aeo)),
    geo: average(detailedScores.map((scores) => scores.geo)),
    performance: NEUTRAL_SCORE,
    content: average(detailedScores.map((scores) => scores.structure)),
    visibility: NEUTRAL_SCORE,
  };
}
