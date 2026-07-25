import { NextRequest, NextResponse } from "next/server";
import { captureSnapshot } from "@/lib/analytics/snapshot/captureSnapshot";
import { getLatestSnapshot } from "@/lib/analytics/snapshot/SnapshotRepository";

/**
 * Same shared-secret convention as app/api/revalidate/route.ts, plus
 * support for Vercel Cron's own Authorization: Bearer <CRON_SECRET>
 * header (vercel.json's crons entry triggers this with GET, no query
 * string) — either form is accepted so this also works when triggered
 * manually or from a GitHub Action. CRON_SECRET is checked first since
 * that's the exact env var name Vercel auto-populates the Bearer header
 * from when it exists; SNAPSHOT_CRON_SECRET is kept as a fallback for
 * deployments that already set it.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.SNAPSHOT_CRON_SECRET;
  if (!secret) return false;

  const queryToken = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  return queryToken === secret || authHeader === `Bearer ${secret}`;
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const latest = await getLatestSnapshot();
    if (latest && isSameUtcDay(new Date(latest.timestamp), new Date())) {
      return NextResponse.json({ captured: false, skipped: "already-captured-today", snapshot: latest });
    }

    const { snapshot, errors } = await captureSnapshot();
    return NextResponse.json({ captured: true, snapshot, errors });
  } catch (error) {
    return NextResponse.json(
      { captured: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
