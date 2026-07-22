import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { popularTagsQuery } from "@/sanity/lib/queries";
import { normalizePersianText } from "@/lib/utils/textNormalize";

type PopularTag = { title: string; slug: { current: string }; count: number };

export async function GET() {
  const tags = await client.fetch<PopularTag[]>(popularTagsQuery);
  const normalized = tags.map((tag) => ({ ...tag, title: normalizePersianText(tag.title) }));
  return NextResponse.json({ tags: normalized });
}
