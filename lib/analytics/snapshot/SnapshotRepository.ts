import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import type { AnalyticsSnapshot } from "./types";

const ALL_SNAPSHOTS_QUERY = groq`*[_type == "analyticsSnapshot"] | order(timestamp asc)`;
const SNAPSHOTS_SINCE_QUERY = groq`*[_type == "analyticsSnapshot" && timestamp >= $since] | order(timestamp asc)`;
const LATEST_SNAPSHOT_QUERY = groq`*[_type == "analyticsSnapshot"] | order(timestamp desc)[0]`;

/**
 * Storage for the Historical Snapshot Engine — reuses Sanity, the
 * project's one existing persistent datastore, rather than a new local
 * JSON file or external database. A local file would not survive
 * Vercel's serverless/read-only production filesystem (see CLAUDE.md:
 * this project deploys to Vercel), so it wouldn't actually accumulate
 * history in production; Sanity is the only "local to this project"
 * store that genuinely persists there. Append-only by construction: this
 * file never exposes an update or delete for a snapshot.
 */
export async function createSnapshot(snapshot: AnalyticsSnapshot): Promise<{ id: string }> {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error("SANITY_API_TOKEN is not configured — cannot write an analytics snapshot");
  }

  const created = await writeClient.create({ _type: "analyticsSnapshot", ...snapshot });
  return { id: created._id };
}

export async function listSnapshotsSince(sinceIso: string): Promise<AnalyticsSnapshot[]> {
  return client.fetch<AnalyticsSnapshot[]>(SNAPSHOTS_SINCE_QUERY, { since: sinceIso });
}

export async function listAllSnapshots(): Promise<AnalyticsSnapshot[]> {
  return client.fetch<AnalyticsSnapshot[]>(ALL_SNAPSHOTS_QUERY);
}

export async function getLatestSnapshot(): Promise<AnalyticsSnapshot | null> {
  const result = await client.fetch<AnalyticsSnapshot | null>(LATEST_SNAPSHOT_QUERY);
  return result ?? null;
}
