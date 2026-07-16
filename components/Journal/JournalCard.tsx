import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { highlightText } from "@/lib/utils/highlight";

export type ArticlePreview = {
  slug: { current: string } | string;
  title: string;
  excerpt: string;
  topic?: string;
  readingTime?: number;
  publishedAt?: string;
  featuredImage?: unknown;
  featuredImageAlt?: string;
  category?: { title: string } | string;
  author?: { name: string };
  tags?: { title: string; slug: { current: string } }[];
};

type Props = {
  item: ArticlePreview;
  highlightQuery?: string;
};

export default function JournalCard({ item, highlightQuery }: Props) {
  const slugStr = typeof item.slug === "string" ? item.slug : item.slug.current;
  const categoryLabel =
    (typeof item.category === "string" ? item.category : item.category?.title) || item.topic;

  return (
    <Link href={`/journal/${slugStr}`} className="card">
      {item.featuredImage ? (
        <div style={{ margin: "-2.4rem -2.4rem 1.6rem", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
          <Image
            src={urlFor(item.featuredImage).width(640).height(400).url()}
            alt={item.featuredImageAlt || item.title}
            width={640}
            height={400}
            style={{ width: "100%", height: "auto", borderRadius: 0 }}
          />
        </div>
      ) : null}

      {categoryLabel && <p className="overline">{categoryLabel}</p>}
      <h3 className="card-title">
        {highlightQuery ? highlightText(item.title, highlightQuery) : item.title}
      </h3>
      <p className="card-text">
        {highlightQuery ? highlightText(item.excerpt, highlightQuery) : item.excerpt}
      </p>

      {item.tags && item.tags.length > 0 && (
        <div className="cluster" style={{ marginTop: "1.2rem", gap: ".6rem" }}>
          {item.tags.map((tag) => (
            <span key={tag.slug.current} className="tag">
              {tag.title}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="cluster" style={{ gap: ".8rem" }}>
          {item.author?.name && <span className="caption">{item.author.name}</span>}
          {item.author?.name && (item.readingTime || item.publishedAt) && (
            <span className="caption">·</span>
          )}
          {item.readingTime && <span className="caption">{item.readingTime} دقیقه مطالعه</span>}
          {item.readingTime && item.publishedAt && <span className="caption">·</span>}
          {item.publishedAt && (
            <span className="caption">
              {new Date(item.publishedAt).toLocaleDateString("fa-IR")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
