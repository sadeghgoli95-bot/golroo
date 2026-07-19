import type { ArticleSource } from "../types";

type WarningCheckInput = {
  title: string | null;
  slug: string | null;
  metaDescription: string | null;
  readingTime: number | null;
  keywords: string[];
  sources: ArticleSource[];
  body?: string | null;
  excerpt?: string | null;
};

export function extractWarnings(input: WarningCheckInput): string[] {
  const warnings: string[] = [];

  if (!input.title) warnings.push("عنوان وجود ندارد");
  if (input.slug === null) warnings.push("Slug نامعتبر است");
  if (!input.metaDescription) warnings.push("Meta Description وجود ندارد");
  if (input.readingTime === null) warnings.push("Reading Time وجود ندارد");
  if (input.keywords.length === 0) warnings.push("Keywords خالی است");
  if (input.body !== undefined && !input.body) warnings.push("بدنه مقاله وجود ندارد");
  if (input.excerpt !== undefined && !input.excerpt) warnings.push("خلاصه وجود ندارد");

  const sourcesWithoutDoi = input.sources.filter((source) => !source.doi).length;
  if (sourcesWithoutDoi > 0) {
    warnings.push(`${sourcesWithoutDoi} Source بدون DOI`);
  }

  return warnings;
}
