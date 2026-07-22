import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search/searchArticles";
import { normalizePersianText } from "@/lib/utils/textNormalize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const results = await searchArticles(q);
  const suggestions = results.slice(0, 8).map((result) => ({
    title: normalizePersianText(result.title),
    slug: result.slug,
    readingTime: result.readingTime,
    publishedAt: result.publishedAt,
    category: result.categoryTitle ? { title: normalizePersianText(result.categoryTitle) } : undefined,
  }));

  return NextResponse.json({ suggestions });
}
