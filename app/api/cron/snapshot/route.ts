import { NextRequest, NextResponse } from "next/server";
import { captureSnapshot } from "@/lib/analytics/snapshot/captureSnapshot";

/**
 * Same shared-secret convention as app/api/revalidate/route.ts, plus
 * support for Vercel Cron's own Authorization: Bearer <CRON_SECRET>
 * header (vercel.json's crons entry triggers this with GET, no query
 * string) — either form is accepted so this also works when triggered
 * manually or from a GitHub Action.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SNAPSHOT_CRON_SECRET;
  if (!secret) return false;

  const queryToken = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  return queryToken === secret || authHeader === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const { snapshot, errors } = await captureSnapshot();
    return NextResponse.json({ captured: true, snapshot, errors });
  } catch (error) {
    return NextResponse.json(
      { captured: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
