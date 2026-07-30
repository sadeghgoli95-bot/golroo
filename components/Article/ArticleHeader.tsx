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
  authorSlug?: string;
};

export default function ArticleHeader({
  title,
  excerpt,
  date,
  readingTime,
  category,
  categorySlug,
  authorName,
  authorSlug,
}: Props) {
  return (
    <header className="reading">
      {category && categorySlug ? (
        <Link href={`/journal/category/${categorySlug}`} className="article-overline">
          {category}
        </Link>
      ) : (
        <p className="article-overline">{category || "THERAPEUTIC JOURNAL"}</p>
      )}
      <h1 className="article-title">{title}</h1>
      {excerpt && <p className="article-excerpt">{excerpt}</p>}
      <div className="article-header-meta">
        {authorName &&
          (authorSlug ? (
            <Link href={`/journal/author/${authorSlug}`}>{authorName}</Link>
          ) : (
            <span>{authorName}</span>
          ))}
        {authorName && date && <span>·</span>}
        {date && <span>{date}</span>}
        {readingTime > 0 && <ReadingTime minutes={readingTime} />}
      </div>
    </header>
  );
}
