import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleGrid from "@/components/Journal/ArticleGrid";
import type { ArticlePreview } from "@/components/Journal/JournalCard";
import EmptyState from "@/components/Journal/EmptyState";
import Pagination from "@/components/Journal/Pagination";
import { JsonLd } from "@/components/Seo/JsonLd";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  authorBySlugQuery,
  articlesByAuthorQuery,
  articlesByAuthorCountQuery,
  authorLatestPublishedAtQuery,
} from "@/sanity/lib/queries";
import { formatArticleCount, toPersianDigits } from "@/lib/utils/persian";
import { siteConfig } from "@/lib/siteConfig";

const PAGE_SIZE = 12;

type Author = {
  name: string;
  slug: { current: string };
  image?: unknown;
  title?: string;
  bio?: string;
  degree?: string;
  organization?: string;
  interests?: string[];
  quote?: string;
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getAuthor(slug: string) {
  return client.fetch<Author | null>(authorBySlugQuery, { slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};

  const description = author.bio || `نوشته‌های ${author.name} در ژورنال گل‌رو.`;

  return {
    title: `${author.name} | ژورنال`,
    description,
    alternates: { canonical: `/journal/author/${slug}` },
    openGraph: {
      title: `${author.name} | ژورنال`,
      description,
      url: `${siteConfig.url}/journal/author/${slug}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} | ژورنال`,
      description,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const author = await getAuthor(slug);
  if (!author) notFound();

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [articles, total, latestPublishedAt] = await Promise.all([
    client.fetch<(ArticlePreview & { _id: string })[]>(articlesByAuthorQuery, { slug, start, end }),
    client.fetch<number>(articlesByAuthorCountQuery, { slug }),
    client.fetch<string | null>(authorLatestPublishedAtQuery, { slug }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main dir="rtl">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: author.name,
            jobTitle: author.title,
            description: author.bio,
            image: author.image ? urlFor(author.image).width(400).height(400).url() : undefined,
            url: `${siteConfig.url}/journal/author/${slug}`,
          }}
        />

        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 900 }}>
            <Breadcrumb
              items={[
                { label: "خانه", href: "/" },
                { label: "ژورنال", href: "/journal" },
                { label: author.name },
              ]}
            />

            <div className="stack-lg">
              <div className="cluster" style={{ gap: "1.6rem", alignItems: "center" }}>
                {author.image ? (
                  <Image
                    src={urlFor(author.image).width(160).height(160).url()}
                    alt={author.name}
                    width={80}
                    height={80}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : null}
                <div>
                  <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
                    {author.name}
                  </h1>
                  {author.title && <p className="lead">{author.title}</p>}
                </div>
              </div>

              {author.bio && (
                <p className="body-lg" style={{ color: "var(--muted)", maxWidth: "68ch" }}>
                  {author.bio}
                </p>
              )}

              {(author.degree || author.organization || (author.interests && author.interests.length > 0)) && (
                <div className="stack" style={{ gap: ".6rem" }}>
                  {author.degree && (
                    <p className="body" style={{ color: "var(--muted)" }}>
                      مدرک تحصیلی: {author.degree}
                    </p>
                  )}
                  {author.organization && (
                    <p className="body" style={{ color: "var(--muted)" }}>
                      کلینیک / سازمان: {author.organization}
                    </p>
                  )}
                  {author.interests && author.interests.length > 0 && (
                    <div className="cluster" style={{ gap: ".6rem", marginTop: ".5rem" }}>
                      {author.interests.map((interest) => (
                        <span key={interest} className="tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {author.quote && (
                <blockquote className="pull-quote">{author.quote}</blockquote>
              )}

              <div className="cluster" style={{ gap: "2rem" }}>
                <p className="caption">{formatArticleCount(total)}</p>
                {latestPublishedAt && (
                  <p className="caption">
                    آخرین انتشار:{" "}
                    {toPersianDigits(
                      new Date(latestPublishedAt).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container">
            {articles.length > 0 ? (
              <>
                <ArticleGrid articles={articles} />
                <Pagination
                  basePath={`/journal/author/${slug}`}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <EmptyState text="هنوز مقاله‌ای از این نویسنده منتشر نشده است." />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
