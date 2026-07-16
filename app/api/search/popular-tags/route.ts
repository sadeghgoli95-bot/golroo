import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { popularTagsQuery } from "@/sanity/lib/queries";

export async function GET() {
  const tags = await client.fetch(popularTagsQuery);
  return NextResponse.json({ tags });
}
