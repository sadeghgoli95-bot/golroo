import Link from "next/link";
import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import { highlightText } from "@/lib/utils/highlight";
import { normalizePersianText } from "@/lib/utils/textNormalize";

export type ArticlePreview = {
  slug: { current: string } | string;
  title: string;
  excerpt: string;
  topic?: string;
  readingTime?: number;
  publishedAt?: string;
  featuredImage?: SanityImageSource;
  featuredImageAlt?: string;
  category?: { title: string; slug?: { current: string } } | string;
  author?: { name: string; slug?: { current: string } };
  tags?: { title: string; slug: { current: string } }[];
};

type Props = {
  item: ArticlePreview;
  highlightQuery?: string;
  /** Minimal variant: category, title, 2-line excerpt, reading time and date only — no image, tags or author. */
  compact?: boolean;
};

export default function JournalCard({ item, highlightQuery, compact }: Props) {
  const slugStr = typeof item.slug === "string" ? item.slug : item.slug.current;
  const articleHref = `/journal/${slugStr}`;

  const categoryLabel = normalizePersianText(
    (typeof item.category === "string" ? item.category : item.category?.title) || item.topic
  );
  const categorySlug = typeof item.category === "string" ? undefined : item.category?.slug?.current;
  const title = normalizePersianText(item.title);
  const excerpt = normalizePersianText(item.excerpt);

  return (
    <article className={compact ? "card journal-card-compact" : "card"}>
      {!compact && item.featuredImage && (
        <Link href={articleHref} tabIndex={-1} aria-hidden="true">
          <div style={{ margin: "-2.4rem -2.4rem 1.6rem", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
            <Image
              src={urlFor(item.featuredImage).width(640).height(400).url()}
              alt=""
              width={640}
              height={400}
              style={{ width: "100%", height: "auto", borderRadius: 0 }}
            />
          </div>
        </Link>
      )}

      {categoryLabel &&
        (categorySlug ? (
          <Link href={`/journal/category/${categorySlug}`} className="overline">
            {categoryLabel}
          </Link>
        ) : (
          <p className="overline">{categoryLabel}</p>
        ))}

      <h3 className="card-title">
        <Link href={articleHref} style={{ color: "inherit" }}>
          {highlightQuery ? highlightText(title, highlightQuery) : title}
        </Link>
      </h3>

      <p className="card-text">
        {highlightQuery ? highlightText(excerpt, highlightQuery) : excerpt}
      </p>

      {!compact && item.tags && item.tags.length > 0 && (
        <div className="cluster" style={{ marginTop: "1.2rem", gap: ".6rem" }}>
          {item.tags.map((tag) => (
            <Link key={tag.slug.current} href={`/journal/tag/${tag.slug.current}`} className="tag">
              {normalizePersianText(tag.title)}
            </Link>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="cluster" style={{ gap: ".8rem" }}>
          {!compact && item.author?.name &&
            (item.author.slug?.current ? (
              <Link href={`/journal/author/${item.author.slug.current}`} className="caption">
                {normalizePersianText(item.author.name)}
              </Link>
            ) : (
              <span className="caption">{normalizePersianText(item.author.name)}</span>
            ))}
          {!compact && item.author?.name && (item.readingTime || item.publishedAt) && (
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
    </article>
  );
}
