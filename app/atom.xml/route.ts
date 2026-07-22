import { NextResponse } from "next/server";
import { getFeedArticles } from "@/lib/feed/getFeedArticles";
import { buildAtomEntry } from "@/lib/feed/buildFeedItem";
import { escapeXml } from "@/lib/feed/xml";
import { siteConfig } from "@/lib/siteConfig";

export const revalidate = 3600;

/** Atom 1.0 feed — same data source as app/feed.xml (RSS) and app/sitemap.ts, so all three never diverge. */
export async function GET() {
  const articles = await getFeedArticles();
  const entries = articles.map(buildAtomEntry).filter((entry): entry is string => entry !== null);

  const latestUpdate =
    articles
      .map((article) => article.lastUpdated ?? article.publishedAt)
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1) ?? new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.name)}</title>
  <link href="${escapeXml(siteConfig.url)}/atom.xml" rel="self" />
  <link href="${escapeXml(siteConfig.url)}" />
  <id>${escapeXml(siteConfig.url)}/</id>
  <updated>${new Date(latestUpdate).toISOString()}</updated>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
${entries.join("\n")}
</feed>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
