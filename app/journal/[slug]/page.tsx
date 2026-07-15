import { notFound } from "next/navigation";
import { PortableText, type PortableTextBlock } from "next-sanity";
import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleHeader from "@/components/Article/ArticleHeader";
import ArticleBody from "@/components/Article/ArticleBody";
import ArticleFooter from "@/components/Article/ArticleFooter";
import { client } from "@/sanity/lib/client";
import { articleQuery } from "@/sanity/lib/queries";

type Article = {
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  body: PortableTextBlock[];
  seo?: { metaTitle?: string; metaDescription?: string };
};

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  return client.fetch<Article | null>(articleQuery, { slug });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return {
    title: article ? `${article.seo?.metaTitle || article.title} | گل‌رو` : "گل‌رو",
    description: article?.seo?.metaDescription || article?.excerpt,
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <ArticleHeader
              title={article.title}
              excerpt={article.excerpt}
              date={new Date(article.publishedAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              readingTime={article.readingTime}
            />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <ArticleBody>
              <PortableText value={article.body} />
            </ArticleBody>
            <ArticleFooter />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
