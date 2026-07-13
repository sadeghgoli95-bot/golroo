import ReadingTime from "./ReadingTime";

type Props = {
  title: string;
  excerpt: string;
  date: string;
  readingTime: number;
};

export default function ArticleHeader({ title, excerpt, date, readingTime }: Props) {
  return (
    <header className="reading">
      <p className="overline">THERAPEUTIC JOURNAL</p>
      <h1 className="display">{title}</h1>
      <p className="lead">{excerpt}</p>
      <div className="article-header-meta">
        <span>{date}</span>
        <ReadingTime minutes={readingTime} />
      </div>
    </header>
  );
}
