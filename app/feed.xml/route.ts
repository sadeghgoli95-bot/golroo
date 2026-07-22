import { NextResponse } from "next/server";
import { getFeedArticles } from "@/lib/feed/getFeedArticles";
import { buildRssItem } from "@/lib/feed/buildFeedItem";
import { escapeXml } from "@/lib/feed/xml";
import { siteConfig } from "@/lib/siteConfig";

export const revalidate = 3600;

/** RSS 2.0 feed — real Sanity-backed data, drafts excluded, same source as app/sitemap.ts and app/atom.xml. */
export async function GET() {
  const articles = await getFeedArticles();
  const items = articles.map(buildRssItem).filter((item): item is string => item !== null);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <atom:link href="${escapeXml(siteConfig.url)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(siteConfig.description)}</description>
    <language>fa-IR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
