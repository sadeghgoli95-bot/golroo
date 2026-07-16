import ArticleGrid from "./ArticleGrid";
import type { ArticlePreview } from "./JournalCard";
import { client } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";

export default async function JournalGrid() {
  const articles = await client.fetch<(ArticlePreview & { _id: string })[]>(articlesQuery);

  return <ArticleGrid articles={articles} />;
}
