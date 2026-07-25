import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { compareValues } from "../comparison";
import { detectAllDecayEvents, detectAllRecoveryEvents } from "./streaks";

export type TimelineEntryType = "decay" | "recovery" | "notable-jump";

export type TimelineEntry = {
  id: string;
  timestamp: string;
  type: TimelineEntryType;
  key: MetricKey;
  label: string;
  description: string;
};

/**
 * A day-over-day (or, since snapshots are one-per-day, snapshot-over-
 * snapshot) change of >= 25% is flagged as a notable single-day jump.
 * Big enough to not be routine noise, small enough to still catch real
 * one-day events (an article going viral, a GSC data gap, a bulk
 * publish) without flooding the changelog.
 */
const NOTABLE_JUMP_PERCENT = 25;

/**
 * Item 11 (Timeline / Milestones / Change Log): every entry here is a
 * real detected event — a decay streak, a recovery streak (items 7-8),
 * or a real single-snapshot jump past NOTABLE_JUMP_PERCENT — never
 * invented narrative content. Sorted newest first.
 */
export function buildTimeline(snapshots: AnalyticsSnapshot[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const event of detectAllDecayEvents(snapshots)) {
    const first = event.values[0];
    const last = event.values[event.values.length - 1];
    entries.push({
      id: `decay-${event.key}-${last.timestamp}`,
      timestamp: last.timestamp,
      type: "decay",
      key: event.key,
      label: event.label,
      description: `${event.label}: افت پیاپی در ${event.streakLength} بازه اخیر (${first.value} → ${last.value})`,
    });
  }

  for (const event of detectAllRecoveryEvents(snapshots)) {
    const first = event.values[0];
    const last = event.values[event.values.length - 1];
    entries.push({
      id: `recovery-${event.key}-${last.timestamp}`,
      timestamp: last.timestamp,
      type: "recovery",
      key: event.key,
      label: event.label,
      description: `${event.label}: بهبود پیاپی در ${event.streakLength} بازه اخیر (${first.value} → ${last.value})`,
    });
  }

  for (const metric of METRICS) {
    const sorted = [...snapshots]
      .filter((snapshot) => snapshot[metric.key] !== null && snapshot[metric.key] !== undefined)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (let i = 1; i < sorted.length; i++) {
      const previousValue = sorted[i - 1][metric.key] as number;
      const currentValue = sorted[i][metric.key] as number;
      const comparison = compareValues(currentValue, previousValue);

      if (comparison.percentChange !== null && Math.abs(comparison.percentChange) >= NOTABLE_JUMP_PERCENT) {
        entries.push({
          id: `jump-${metric.key}-${sorted[i].timestamp}`,
          timestamp: sorted[i].timestamp,
          type: "notable-jump",
          key: metric.key,
          label: metric.label,
          description: `${metric.label}: تغییر ${comparison.percentChange.toFixed(1)}٪ نسبت به عکس‌فوری قبلی (${previousValue} → ${currentValue})`,
        });
      }
    }
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export type TimelineBuckets = {
  today: TimelineEntry[];
  thisWeek: TimelineEntry[];
  thisMonth: TimelineEntry[];
  earlier: TimelineEntry[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Compact executive timeline (Phase 3 Part 1 — Today / This Week / This
 * Month). Pure presentation-layer bucketing of the already real, already
 * detected events from buildTimeline — no new event detection, no
 * fabricated signal, just grouping by real elapsed time since `now`.
 * "This Week" and "This Month" are exclusive of the more recent bucket
 * (an event from yesterday appears only in "این هفته", not also in
 * "این ماه") so every real event appears in exactly one bucket.
 */
export function bucketTimelineByRecency(entries: TimelineEntry[], now: Date = new Date()): TimelineBuckets {
  const buckets: TimelineBuckets = { today: [], thisWeek: [], thisMonth: [], earlier: [] };
  const nowTime = now.getTime();

  for (const entry of entries) {
    const daysAgo = Math.floor((nowTime - new Date(entry.timestamp).getTime()) / MS_PER_DAY);
    if (daysAgo <= 0) buckets.today.push(entry);
    else if (daysAgo <= 7) buckets.thisWeek.push(entry);
    else if (daysAgo <= 30) buckets.thisMonth.push(entry);
    else buckets.earlier.push(entry);
  }

  return buckets;
}
