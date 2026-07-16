import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleGrid from "@/components/Journal/ArticleGrid";
import Pagination from "@/components/Journal/Pagination";
import { client } from "@/sanity/lib/client";
import { searchResultsQuery, searchResultsCountQuery } from "@/sanity/lib/queries";
import { type ArticlePreview } from "@/components/Journal/JournalCard";
import { formatArticleCount } from "@/lib/utils/persian";
import { siteConfig } from "@/lib/siteConfig";
import Link from "next/link";

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `نتایج جستجو برای «${q}»` : "جستجو",
    robots: { index: false, follow: false },
    alternates: { canonical: `${siteConfig.url}/search${q ? `?q=${encodeURIComponent(q)}` : ""}` },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const query = (q || "").trim();
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const matchPattern = query ? `*${query}*` : "";

  const [articles, total] = query
    ? await Promise.all([
        client.fetch<(ArticlePreview & { _id: string })[]>(searchResultsQuery, {
          q: matchPattern,
          start,
          end,
        }),
        client.fetch<number>(searchResultsCountQuery, { q: matchPattern }),
      ])
    : [[], 0];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 900 }}>
            <p className="overline">SEARCH</p>
            <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
              نتایج جستجو
            </h1>

            {query && (
              <p className="lead">
                عبارت جستجو: <strong style={{ color: "var(--primary)" }}>«{query}»</strong>
              </p>
            )}

            <form action="/search" method="get" role="search" style={{ marginTop: "3rem" }}>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="جستجو در ژورنال..."
                aria-label="جستجو در ژورنال"
                className="search-input"
              />
            </form>

            {query && (
              <p className="caption" style={{ marginTop: "1.5rem" }}>
                {formatArticleCount(total)} پیدا شد
              </p>
            )}
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container">
            {!query ? null : articles.length > 0 ? (
              <>
                <ArticleGrid articles={articles} highlightQuery={query} />
                <Pagination
                  basePath={`/search?q=${encodeURIComponent(query)}`}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <div className="empty-state">
                <div className="stack" style={{ gap: ".8rem" }}>
                  <p className="body-lg" style={{ color: "var(--text)" }}>
                    نتیجه‌ای پیدا نشد.
                  </p>
                  <p className="body" style={{ color: "var(--muted)" }}>
                    ممکن است عبارت دیگری را امتحان کنید یا همه مقالات را مشاهده کنید.
                  </p>
                </div>
                <Link href="/journal" className="button button-primary">
                  مشاهده همه مقالات
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
