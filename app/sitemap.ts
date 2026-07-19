import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { siteConfig } from "@/lib/siteConfig";

const allArticlesQuery = /* groq */ `
  *[_type == "article" && status != "draft"]{
    "slug": slug.current,
    publishedAt,
    lastUpdated
  }
`;

const usedCategoriesQuery = /* groq */ `
  *[_type == "category" && count(*[_type == "article" && status != "draft" && references(^._id)]) > 0]{
    "slug": slug.current
  }
`;

const usedTagsQuery = /* groq */ `
  *[_type == "tag" && count(*[_type == "article" && status != "draft" && references(^._id)]) > 0]{
    "slug": slug.current
  }
`;

const usedAuthorsQuery = /* groq */ `
  *[_type == "author" && count(*[_type == "article" && status != "draft" && references(^._id)]) > 0]{
    "slug": slug.current
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/journal`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/knowledge`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/observations`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/contact`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/appointment`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/faq`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const [articles, categories, tags, authors] = await Promise.all([
    client.fetch<{ slug: string; publishedAt?: string; lastUpdated?: string }[]>(allArticlesQuery),
    client.fetch<{ slug: string }[]>(usedCategoriesQuery),
    client.fetch<{ slug: string }[]>(usedTagsQuery),
    client.fetch<{ slug: string }[]>(usedAuthorsQuery),
  ]);

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/journal/${article.slug}`,
    lastModified: article.lastUpdated || article.publishedAt || undefined,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/journal/category/${category.slug}`,
    priority: 0.5,
    changeFrequency: "weekly",
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${base}/journal/tag/${tag.slug}`,
    priority: 0.4,
    changeFrequency: "weekly",
  }));

  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${base}/journal/author/${author.slug}`,
    priority: 0.4,
    changeFrequency: "monthly",
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...tagRoutes, ...authorRoutes];
}
