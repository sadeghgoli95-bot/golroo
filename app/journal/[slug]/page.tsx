import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { articleQuery } from "@/sanity/lib/queries";
import { PortableText } from "next-sanity";
import ArticleFooter from "@/components/Article/ArticleFooter";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });
  if (!article) return {};
  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await client.fetch(articleQuery, { slug });

  if (!article) notFound();

  return (
    <>
      <Navbar />
      <main dir="rtl">

        <section className="article-hero">
          <div className="article-container">
            <p className="article-overline">THERAPEUTIC JOURNAL</p>
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              {article.readingTime && (
                <span>{article.readingTime} دقیقه مطالعه</span>
              )}
              {article.readingTime && article.publishedAt && <span>•</span>}
              {article.publishedAt && (
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("fa-IR")}
                </span>
              )}
            </div>
            {article.excerpt && (
              <p className="article-excerpt">{article.excerpt}</p>
            )}
          </div>
        </section>

        <article className="article-container" style={{ paddingBottom: "8rem" }}>
          {article.window && (
            <div style={{
              borderRight: "2px solid var(--accent)",
              paddingRight: "1.5rem",
              margin: "3rem 0",
              color: "var(--text-soft)",
              fontSize: "1.1rem",
              lineHeight: 2,
            }}>
              {article.window}
            </div>
          )}

          {article.callout && (
            <div style={{
              background: "var(--surface)",
              padding: "1.5rem 2rem",
              margin: "2rem 0",
              fontSize: "1rem",
              lineHeight: 2,
              color: "var(--text-soft)",
            }}>
              {article.callout}
            </div>
          )}

          {article.body && (
            <div className="article-body">
              <PortableText value={article.body} />
            </div>
          )}

          {article.importantPoints && article.importantPoints.length > 0 && (
            <div style={{ margin: "3rem 0" }}>
              <p style={{ color: "var(--bronze)", letterSpacing: ".15em", fontSize: ".85rem", marginBottom: "1rem" }}>
                نکات مهم
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
                {article.importantPoints.map((point: string, i: number) => (
                  <li key={i} style={{
                    paddingRight: "1.5rem",
                    borderRight: "1px solid var(--line)",
                    color: "var(--text-soft)",
                    lineHeight: 2,
                  }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.finalThought && (
            <div style={{ margin: "3rem 0", color: "var(--text-soft)", lineHeight: 2.2 }}>
              <p style={{ color: "var(--bronze)", letterSpacing: ".15em", fontSize: ".85rem", marginBottom: "1rem" }}>
                جمع‌بندی
              </p>
              <p>{article.finalThought}</p>
            </div>
          )}

          {article.finalQuestion && (
            <div style={{
              margin: "3rem 0",
              padding: "2rem",
              border: "1px solid var(--line)",
              color: "var(--text-soft)",
              lineHeight: 2,
              fontSize: "1.1rem",
            }}>
              {article.finalQuestion}
            </div>
          )}

          <ArticleFooter />
        </article>

      </main>
    </>
  );
}
