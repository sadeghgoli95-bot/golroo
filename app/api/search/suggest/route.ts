import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search/searchArticles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const results = await searchArticles(q);
  const suggestions = results.slice(0, 8).map((result) => ({
    title: result.title,
    slug: result.slug,
    readingTime: result.readingTime,
    publishedAt: result.publishedAt,
    category: result.categoryTitle ? { title: result.categoryTitle } : undefined,
  }));

  return NextResponse.json({ suggestions });
}
