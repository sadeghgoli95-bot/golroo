import type { ArticleSource } from "../types";

type WarningCheckInput = {
  title: string | null;
  slug: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  sources: ArticleSource[];
  body: string | null;
  excerpt: string | null;
};

export function extractWarnings(input: WarningCheckInput): string[] {
  const warnings: string[] = [];

  if (!input.title) warnings.push("عنوان وجود ندارد");
  if (input.slug === null) warnings.push("Slug نامعتبر است");
  if (!input.metaDescription) warnings.push("Meta Description وجود ندارد");
  if (!input.focusKeyword) warnings.push("Focus Keyword وجود ندارد");
  if (!input.body) warnings.push("بدنه مقاله وجود ندارد");
  if (!input.excerpt) warnings.push("خلاصه وجود ندارد");

  const sourcesWithoutIdentifier = input.sources.filter((source) => !source.doi && !source.url).length;
  if (sourcesWithoutIdentifier > 0) {
    warnings.push(`${sourcesWithoutIdentifier} Source بدون DOI یا URL`);
  }

  return warnings;
}
