import Link from "next/link";

type Props = {
  item: {
    slug: string;
    category: string;
    title: string;
    excerpt: string;
    readingTime: number;
  };
};

export default function JournalCard({ item }: Props) {
  return (
    <Link href={`/journal/${item.slug}`} className="card">
      <p className="overline">{item.category}</p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-text">{item.excerpt}</p>
      <div className="card-footer">
        <span className="caption">{item.readingTime} min</span>
      </div>
    </Link>
  );
}
