import JournalCard from "./JournalCard";
import { client } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";

type ArticlePreview = {
  _id: string;
  title: string;
  excerpt: string;
  topic: string;
  readingTime: number;
  slug: { current: string };
};

export default async function JournalGrid() {
  const articles = await client.fetch<ArticlePreview[]>(articlesQuery);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "2rem" }}>
      {articles.map(article => (
        <JournalCard
          key={article._id}
          item={{
            slug: article.slug.current,
            category: article.topic,
            title: article.title,
            excerpt: article.excerpt,
            readingTime: article.readingTime,
          }}
        />
      ))}
    </div>
  );
}
