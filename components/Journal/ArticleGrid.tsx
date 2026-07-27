import JournalCard, { type ArticlePreview } from "./JournalCard";

type Props = {
  articles: (ArticlePreview & { _id: string })[];
  highlightQuery?: string;
};

export default function ArticleGrid({ articles, highlightQuery }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))",
        gap: "2rem",
      }}
    >
      {articles.map((article) => (
        <JournalCard key={article._id} item={article} highlightQuery={highlightQuery} />
      ))}
    </div>
  );
}
