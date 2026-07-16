import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleGrid from "@/components/Journal/ArticleGrid";
import type { ArticlePreview } from "@/components/Journal/JournalCard";
import EmptyState from "@/components/Journal/EmptyState";
import Pagination from "@/components/Journal/Pagination";
import { client } from "@/sanity/lib/client";
import {
  tagBySlugQuery,
  articlesByTagQuery,
  articlesByTagCountQuery,
  relatedTagsQuery,
  popularTagsQuery,
} from "@/sanity/lib/queries";
import { formatArticleCount } from "@/lib/utils/persian";
import { siteConfig } from "@/lib/siteConfig";

const PAGE_SIZE = 12;

type Tag = { title: string; description?: string; slug: { current: string } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getTag(slug: string) {
  return client.fetch<Tag | null>(tagBySlugQuery, { slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};

  const description = tag.description || `مقالات ژورنال گل‌رو با برچسب ${tag.title}.`;

  return {
    title: `${tag.title} | ژورنال`,
    description,
    alternates: { canonical: `/journal/tag/${slug}` },
    openGraph: {
      title: `${tag.title} | ژورنال`,
      description,
      url: `${siteConfig.url}/journal/tag/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag.title} | ژورنال`,
      description,
    },
  };
}

async function getRelatedTags(slug: string, currentTitle: string) {
  const coOccurring: { tags: { title: string; slug: { current: string } }[] }[] = await client.fetch(
    relatedTagsQuery,
    { slug }
  );

  const counts = new Map<string, { title: string; slug: string; count: number }>();
  for (const article of coOccurring) {
    for (const tag of article.tags || []) {
      if (!tag?.slug?.current || tag.title === currentTitle) continue;
      const existing = counts.get(tag.slug.current);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(tag.slug.current, { title: tag.title, slug: tag.slug.current, count: 1 });
      }
    }
  }

  const related = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (related.length < 8) {
    const popular: { title: string; slug: { current: string }; count: number }[] =
      await client.fetch(popularTagsQuery);
    for (const tag of popular) {
      if (related.length >= 8) break;
      if (tag.slug.current === slug) continue;
      if (related.some((r) => r.slug === tag.slug.current)) continue;
      related.push({ title: tag.title, slug: tag.slug.current, count: tag.count });
    }
  }

  return related.slice(0, 8);
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const tag = await getTag(slug);
  if (!tag) notFound();

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [articles, total, relatedTags] = await Promise.all([
    client.fetch<(ArticlePreview & { _id: string })[]>(articlesByTagQuery, { slug, start, end }),
    client.fetch<number>(articlesByTagCountQuery, { slug }),
    getRelatedTags(slug, tag.title),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container">
            <Breadcrumb
              items={[
                { label: "خانه", href: "/" },
                { label: "ژورنال", href: "/journal" },
                { label: tag.title },
              ]}
            />
            <p className="overline">TAG</p>
            <h1 className="display">{tag.title}</h1>
            {tag.description && <p className="lead">{tag.description}</p>}
            <p className="caption" style={{ marginTop: "1.5rem" }}>
              {formatArticleCount(total)}
            </p>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container">
            {articles.length > 0 ? (
              <>
                <ArticleGrid articles={articles} />
                <Pagination
                  basePath={`/journal/tag/${slug}`}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <EmptyState text="هنوز مقاله‌ای با این برچسب منتشر نشده است." />
            )}
          </div>
        </section>

        {relatedTags.length > 0 && (
          <section className="section-sm" style={{ paddingTop: 0 }}>
            <div className="container">
              <p className="overline" style={{ marginBottom: "1.5rem" }}>
                برچسب‌های مرتبط
              </p>
              <div className="cluster" style={{ gap: ".8rem" }}>
                {relatedTags.map((related) => (
                  <Link key={related.slug} href={`/journal/tag/${related.slug}`} className="tag">
                    {related.title}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
