import Link from "next/link";
import ReadingTime from "./ReadingTime";

type Props = {
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
  category?: string;
  categorySlug?: string;
  authorName?: string;
};

export default function ArticleHeader({
  title,
  excerpt,
  date,
  readingTime,
  category,
  categorySlug,
  authorName,
}: Props) {
  return (
    <header className="reading">
      {category && categorySlug ? (
        <Link href={`/journal/category/${categorySlug}`} className="overline">
          {category}
        </Link>
      ) : (
        <p className="overline">{category || "THERAPEUTIC JOURNAL"}</p>
      )}
      <h1 className="display">{title}</h1>
      {excerpt && <p className="lead">{excerpt}</p>}
      <div className="article-header-meta">
        {authorName && <span>{authorName}</span>}
        {authorName && date && <span>·</span>}
        {date && <span>{date}</span>}
        {readingTime > 0 && <ReadingTime minutes={readingTime} />}
      </div>
    </header>
  );
}
