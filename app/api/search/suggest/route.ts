import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { searchSuggestionsQuery } from "@/sanity/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await client.fetch(searchSuggestionsQuery, { q: `*${q}*` });

  return NextResponse.json({ suggestions });
}
