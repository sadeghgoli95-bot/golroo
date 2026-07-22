import { escapeXml } from "./xml";
import { buildCanonicalUrl } from "@/lib/article/canonicalUrl";
import { resolveAuthorName } from "@/lib/article/constants";
import type { FeedArticle } from "./getFeedArticles";

/** RSS 2.0 <item>. Returns null for an article with no slug/title — never emits a malformed entry. */
export function buildRssItem(article: FeedArticle): string | null {
  const url = buildCanonicalUrl(article.slug);
  if (!url || !article.title) return null;

  const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : null;
  const modifiedDate = article.lastUpdated ? new Date(article.lastUpdated).toUTCString() : pubDate;

  return [
    "    <item>",
    `      <title>${escapeXml(article.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
    modifiedDate ? `      <atom:updated>${modifiedDate}</atom:updated>` : null,
    `      <author>${escapeXml(resolveAuthorName(article.authorName))}</author>`,
    article.categoryTitle ? `      <category>${escapeXml(article.categoryTitle)}</category>` : null,
    article.excerpt ? `      <description>${escapeXml(article.excerpt)}</description>` : null,
    "    </item>",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/** Atom 1.0 <entry>. Returns null for an article with no slug/title — never emits a malformed entry. */
export function buildAtomEntry(article: FeedArticle): string | null {
  const url = buildCanonicalUrl(article.slug);
  if (!url || !article.title) return null;

  const published = article.publishedAt ? new Date(article.publishedAt).toISOString() : null;
  const updated = article.lastUpdated
    ? new Date(article.lastUpdated).toISOString()
    : (published ?? new Date(0).toISOString());

  return [
    "  <entry>",
    `    <title>${escapeXml(article.title)}</title>`,
    `    <link href="${escapeXml(url)}" />`,
    `    <id>${escapeXml(url)}</id>`,
    `    <updated>${updated}</updated>`,
    published ? `    <published>${published}</published>` : null,
    `    <author><name>${escapeXml(resolveAuthorName(article.authorName))}</name></author>`,
    article.categoryTitle ? `    <category term="${escapeXml(article.categoryTitle)}" />` : null,
    article.excerpt ? `    <summary>${escapeXml(article.excerpt)}</summary>` : null,
    "  </entry>",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
