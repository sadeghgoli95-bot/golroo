import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { normalizePersianText } from "@/lib/utils/textNormalize";
import type { ArticlePreview } from "./JournalCard";
import EmptyState from "./EmptyState";

type Article = ArticlePreview & { _id: string };

function slugOf(article: Article): string {
  return typeof article.slug === "string" ? article.slug : article.slug.current;
}

function categoryOf(article: Article): string {
  const raw = (typeof article.category === "string" ? article.category : article.category?.title) || article.topic || "";
  return normalizePersianText(raw);
}

function categorySlugOf(article: Article): string | undefined {
  return typeof article.category === "string" ? undefined : article.category?.slug?.current;
}

function metaLabel(article: Article): string {
  const parts: string[] = [];
  if (article.readingTime) parts.push(`${article.readingTime} دقیقه مطالعه`);
  if (article.publishedAt) parts.push(new Date(article.publishedAt).toLocaleDateString("fa-IR"));
  return parts.join(" · ");
}

function Row({ article }: { article: Article }) {
  const title = normalizePersianText(article.title);
  const excerpt = normalizePersianText(article.excerpt);
  const category = categoryOf(article);
  const meta = metaLabel(article);

  return (
    <Link href={`/journal/${slugOf(article)}`} className="journal-row">
      <div className="journal-row-meta">
        {category && <span className="journal-row-topic">{category}</span>}
        {meta && <span className="journal-row-date">{meta}</span>}
      </div>
      <div className="journal-row-body">
        <h3 className="journal-row-title">{title}</h3>
        {excerpt && <p className="journal-row-excerpt">{excerpt}</p>}
      </div>
      <span className="journal-row-arrow" aria-hidden="true">→</span>
    </Link>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  const title = normalizePersianText(article.title);
  const excerpt = normalizePersianText(article.excerpt);
  const category = categoryOf(article);
  const meta = metaLabel(article);

  return (
    <Link href={`/journal/${slugOf(article)}`} className="journal-featured">
      {article.featuredImage && (
        <div className="journal-featured-media">
          <Image
            src={urlFor(article.featuredImage).width(1280).height(800).url()}
            alt={article.featuredImageAlt || ""}
            width={1280}
            height={800}
            priority
            className="journal-featured-img"
          />
        </div>
      )}
      <div className="journal-featured-body">
        {category && <span className="overline">{category}</span>}
        <h2 className="journal-featured-title">{title}</h2>
        {excerpt && <p className="journal-featured-excerpt">{excerpt}</p>}
        {meta && <span className="journal-featured-meta">{meta}</span>}
        <span className="journal-featured-cta" aria-hidden="true">شروع مطالعه ←</span>
      </div>
    </Link>
  );
}

function RecentCard({ article }: { article: Article }) {
  const title = normalizePersianText(article.title);
  const excerpt = normalizePersianText(article.excerpt);
  const category = categoryOf(article);
  const meta = metaLabel(article);

  return (
    <Link href={`/journal/${slugOf(article)}`} className="journal-recent-card">
      {article.featuredImage && (
        <div className="journal-recent-media">
          <Image
            src={urlFor(article.featuredImage).width(760).height(480).url()}
            alt={article.featuredImageAlt || ""}
            width={760}
            height={480}
            className="journal-recent-img"
          />
        </div>
      )}
      {category && <span className="overline">{category}</span>}
      <h3 className="journal-recent-title">{title}</h3>
      {excerpt && <p className="journal-recent-excerpt">{excerpt}</p>}
      {meta && <span className="caption">{meta}</span>}
    </Link>
  );
}

/**
 * Groups the remaining articles by category for topic-based browsing.
 * Every article that reaches this stage is placed in exactly one group
 * (its own category, or the "سایر یادداشت‌ها" fallback) — none are
 * dropped, only organized, matching the "no pagination, no removal"
 * constraint for this page.
 */
function groupByTopic(articles: Article[]): { label: string; slug?: string; items: Article[] }[] {
  const groups = new Map<string, { label: string; slug?: string; items: Article[] }>();
  const fallbackLabel = "سایر یادداشت‌ها";

  for (const article of articles) {
    const label = categoryOf(article) || fallbackLabel;
    const slug = categorySlugOf(article);
    const key = label;
    if (!groups.has(key)) groups.set(key, { label, slug, items: [] });
    groups.get(key)!.items.push(article);
  }

  return Array.from(groups.values())
    .filter((g) => g.label !== fallbackLabel)
    .concat(groups.has(fallbackLabel) ? [groups.get(fallbackLabel)!] : [])
    .sort((a, b) => (a.label === fallbackLabel ? 1 : b.items.length - a.items.length));
}

type Props = {
  articles: Article[];
};

export default function JournalEditorial({ articles }: Props) {
  if (articles.length === 0) {
    return <EmptyState text="هنوز یادداشتی منتشر نشده است." />;
  }

  const featured = articles.find((a) => a.featuredImage) ?? articles[0];
  const rest = articles.filter((a) => a._id !== featured._id);
  const recent = rest.filter((a) => a.featuredImage).slice(0, 2);
  const recentIds = new Set(recent.map((a) => a._id));
  const remaining = rest.filter((a) => !recentIds.has(a._id));
  const topics = groupByTopic(remaining);

  return (
    <div className="journal-editorial-index">
      <section className="journal-index-section">
        <FeaturedCard article={featured} />
      </section>

      {recent.length > 0 && (
        <section className="journal-index-section">
          <p className="overline journal-index-label">تازه‌ترین نوشته‌ها</p>
          <div className="journal-recent-grid">
            {recent.map((article) => (
              <RecentCard key={article._id} article={article} />
            ))}
          </div>
        </section>
      )}

      {topics.map((topic) => (
        <section key={topic.label} className="journal-index-section">
          <div className="journal-index-topic-header">
            <p className="overline journal-index-label">{topic.label}</p>
            {topic.slug && (
              <Link href={`/journal/category/${topic.slug}`} className="btn-text">
                مشاهده همه
              </Link>
            )}
          </div>
          <div className="journal-rotator-list">
            {topic.items.map((article) => (
              <Row key={article._id} article={article} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
