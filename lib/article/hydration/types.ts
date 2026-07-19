import type { Article } from "../types";

export type HydrationResult = { article: Article; warnings: string[] };

export type Hydrator = (article: Article) => HydrationResult;

/** Runs hydrators left to right, threading the article through each and collecting every warning. */
export function composeHydrators(...hydrators: Hydrator[]): Hydrator {
  return (article) => {
    let current = article;
    const warnings: string[] = [];

    for (const hydrate of hydrators) {
      const result = hydrate(current);
      current = result.article;
      warnings.push(...result.warnings);
    }

    return { article: current, warnings };
  };
}
