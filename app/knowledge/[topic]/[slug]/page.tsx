import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleHeader from "@/components/Article/ArticleHeader";
import ArticleBody from "@/components/Article/ArticleBody";
import ArticleFooter from "@/components/Article/ArticleFooter";
import { topics } from "@/data/topics";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: { topic: string; slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const topic = topics.find((t) => t.slug === params.topic);
  return {
    title: topic ? `${topic.title} | گل‌رو` : "گل‌رو",
  };
}

export default function ArticlePage({ params }: Props) {
  const topic = topics.find((t) => t.slug === params.topic);

  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
              <Link href="/knowledge" className="overline">مرکز دانش</Link>
              <span className="overline" style={{ opacity: .4 }}>←</span>
              {topic && (
                <Link href={`/knowledge/${params.topic}`} className="overline">
                  {topic.title}
                </Link>
              )}
            </div>
            <ArticleHeader
              title="عنوان یادداشت"
              excerpt="این صفحه بعداً به سیستم محتوای پویا متصل خواهد شد."
              date="۱۴۰۵"
              readingTime={3}
            />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <ArticleBody>
              <p>محتوای این یادداشت از پایگاه داده بارگذاری خواهد شد.</p>
            </ArticleBody>
            <ArticleFooter />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
