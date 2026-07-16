import { notFound } from "next/navigation";
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
  categoryBySlugQuery,
  articlesByCategoryQuery,
  articlesByCategoryCountQuery,
} from "@/sanity/lib/queries";
import { formatArticleCount } from "@/lib/utils/persian";
import { siteConfig } from "@/lib/siteConfig";

const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getCategory(slug: string) {
  return client.fetch<{ title: string; description?: string; slug: { current: string } } | null>(
    categoryBySlugQuery,
    { slug }
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  const description =
    category.description || `مقالات ژورنال گل‌رو در دسته‌بندی ${category.title}.`;

  return {
    title: `${category.title} | ژورنال`,
    description,
    alternates: { canonical: `/journal/category/${slug}` },
    openGraph: {
      title: `${category.title} | ژورنال`,
      description,
      url: `${siteConfig.url}/journal/category/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} | ژورنال`,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [articles, total] = await Promise.all([
    client.fetch<(ArticlePreview & { _id: string })[]>(articlesByCategoryQuery, { slug, start, end }),
    client.fetch<number>(articlesByCategoryCountQuery, { slug }),
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
                { label: category.title },
              ]}
            />
            <p className="overline">CATEGORY</p>
            <h1 className="display">{category.title}</h1>
            {category.description && <p className="lead">{category.description}</p>}
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
                  basePath={`/journal/category/${slug}`}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </>
            ) : (
              <EmptyState text="هنوز مقاله‌ای در این دسته منتشر نشده است." />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
