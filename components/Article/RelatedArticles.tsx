import JournalCard, { type ArticlePreview } from "@/components/Journal/JournalCard";

type Props = {
  articles: (ArticlePreview & { _id: string })[];
};

export default function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="article-related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="article-related-title">
        مطالب مرتبط
      </h2>
      <div className="grid-3">
        {articles.map((article) => (
          <JournalCard key={article._id} item={article} compact />
        ))}
      </div>
    </section>
  );
}
