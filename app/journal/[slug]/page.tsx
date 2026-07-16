import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { articleQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "next-sanity";
import { articlePortableTextComponents } from "@/components/Article/portableTextComponents";
import ArticleHeader from "@/components/Article/ArticleHeader";
import ArticleBody from "@/components/Article/ArticleBody";
import ArticleFooter from "@/components/Article/ArticleFooter";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import { JsonLd, articleJsonLd } from "@/components/Seo/JsonLd";
import { siteConfig } from "@/lib/siteConfig";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });
  if (!article) return {};

  const seo = article.seo || {};
  const title = seo.metaTitle || article.title;
  const description = seo.metaDescription || article.excerpt;
  const ogImageSource = seo.ogImage || article.featuredImage;

  return {
    title,
    description,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : { canonical: `/journal/${slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    keywords: seo.keywords,
    openGraph: {
      title,
      description,
      type: "article",
      url: seo.canonicalUrl || `https://golroo.ir/journal/${slug}`,
      images: ogImageSource ? [urlFor(ogImageSource).width(1200).height(630).url()] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: ogImageSource ? [urlFor(ogImageSource).width(1200).height(630).url()] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });

  if (!article) notFound();

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const ogImageSource = article.seo?.ogImage || article.featuredImage;

  return (
    <>
      <Navbar />
      <main dir="rtl">
        <JsonLd
          data={articleJsonLd({
            title: article.title,
            description: article.excerpt,
            url: `${siteConfig.url}/journal/${slug}`,
            image: ogImageSource ? urlFor(ogImageSource).width(1200).height(630).url() : undefined,
            authorName: article.author?.name,
            publishedAt: article.publishedAt,
            modifiedAt: article.lastUpdated,
          })}
        />
        <section className="article-hero">
          <div className="article-container">
            <Breadcrumb
              items={[
                { label: "خانه", href: "/" },
                { label: "ژورنال", href: "/journal" },
                { label: article.title },
              ]}
            />
            <ArticleHeader
              title={article.title}
              excerpt={article.excerpt}
              date={publishedDate}
              readingTime={article.readingTime}
              category={article.category?.title}
              categorySlug={article.category?.slug?.current}
              authorName={article.author?.name}
            />
          </div>
        </section>

        {article.featuredImage && (
          <div className="article-container">
            <Image
              src={urlFor(article.featuredImage).width(1400).height(800).url()}
              alt={article.featuredImageAlt || article.title}
              width={1400}
              height={800}
              priority
              style={{ width: "100%", height: "auto" }}
            />
            {article.imageCaption && (
              <p className="caption" style={{ marginTop: "1rem", textAlign: "center" }}>
                {article.imageCaption}
              </p>
            )}
          </div>
        )}

        <ArticleBody>
          {article.window && (
            <div
              style={{
                borderRight: "2px solid var(--primary)",
                paddingRight: "1.5rem",
                margin: "3rem 0",
                color: "var(--muted)",
                fontSize: "1.1rem",
                lineHeight: 2,
              }}
            >
              {article.window}
            </div>
          )}

          {article.callout && (
            <div
              style={{
                background: "var(--surface)",
                padding: "1.5rem 2rem",
                margin: "2rem 0",
                fontSize: "1rem",
                lineHeight: 2,
                color: "var(--muted)",
              }}
            >
              {article.callout}
            </div>
          )}

          {article.body && (
            <PortableText value={article.body} components={articlePortableTextComponents} />
          )}

          {article.realExample && (
            <PortableText value={article.realExample} components={articlePortableTextComponents} />
          )}

          {article.scientificExplanation && (
            <PortableText
              value={article.scientificExplanation}
              components={articlePortableTextComponents}
            />
          )}

          {article.importantPoints && article.importantPoints.length > 0 && (
            <div style={{ margin: "3rem 0" }}>
              <p
                style={{
                  color: "var(--primary)",
                  letterSpacing: ".15em",
                  fontSize: ".85rem",
                  marginBottom: "1rem",
                }}
              >
                نکات مهم
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
                {article.importantPoints.map((point: string, i: number) => (
                  <li
                    key={i}
                    style={{
                      paddingRight: "1.5rem",
                      borderRight: "1px solid var(--border)",
                      color: "var(--muted)",
                      lineHeight: 2,
                    }}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.finalThought && (
            <div style={{ margin: "3rem 0", color: "var(--muted)", lineHeight: 2.2 }}>
              <p
                style={{
                  color: "var(--primary)",
                  letterSpacing: ".15em",
                  fontSize: ".85rem",
                  marginBottom: "1rem",
                }}
              >
                جمع‌بندی
              </p>
              <p>{article.finalThought}</p>
            </div>
          )}

          {article.finalQuestion && (
            <div
              style={{
                margin: "3rem 0",
                padding: "2rem",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                lineHeight: 2,
                fontSize: "1.1rem",
              }}
            >
              {article.finalQuestion}
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <nav aria-label="برچسب‌ها" className="cluster" style={{ margin: "3rem 0", gap: ".8rem" }}>
              {article.tags.map((tag: { title: string; slug: { current: string } }) => (
                <Link key={tag.slug.current} href={`/journal/tag/${tag.slug.current}`} className="tag">
                  {tag.title}
                </Link>
              ))}
            </nav>
          )}

          {article.sources && article.sources.length > 0 && (
            <section aria-labelledby="sources-heading" style={{ margin: "4rem 0" }}>
              <h2 id="sources-heading" style={{ fontSize: "1.6rem" }}>
                منابع علمی
              </h2>
              <ul className="sources-list" style={{ marginTop: "1.5rem" }}>
                {article.sources.map(
                  (source: {
                    _id: string;
                    title: string;
                    authors?: string;
                    journal?: string;
                    year?: number;
                    url?: string;
                  }) => (
                    <li key={source._id}>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </a>
                      ) : (
                        source.title
                      )}
                      {source.authors && ` — ${source.authors}`}
                      {source.journal && `، ${source.journal}`}
                      {source.year && ` (${source.year})`}
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {article.faq && article.faq.length > 0 && (
            <section aria-labelledby="faq-heading" style={{ margin: "4rem 0" }}>
              <h2 id="faq-heading" style={{ fontSize: "1.6rem" }}>
                سوالات متداول
              </h2>
              <div style={{ marginTop: "1rem" }}>
                {article.faq.map((item: { _id: string; question: string; answer: string }) => (
                  <details key={item._id} className="faq-item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {article.author && (
            <div className="author-card" style={{ margin: "4rem 0" }}>
              {article.author.image && (
                <Image
                  src={urlFor(article.author.image).width(112).height(112).url()}
                  alt={article.author.name}
                  width={56}
                  height={56}
                  className="author-card-photo"
                />
              )}
              <div>
                {article.author.slug?.current ? (
                  <Link href={`/journal/author/${article.author.slug.current}`} className="author-card-name">
                    {article.author.name}
                  </Link>
                ) : (
                  <p className="author-card-name">{article.author.name}</p>
                )}
                {article.author.bio && <p className="author-card-bio">{article.author.bio}</p>}
              </div>
            </div>
          )}
        </ArticleBody>

        <div className="article-container" style={{ paddingBottom: "8rem" }}>
          <ArticleFooter />
        </div>
      </main>
    </>
  );
}
