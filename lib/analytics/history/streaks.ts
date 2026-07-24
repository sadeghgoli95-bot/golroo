import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { sortChronological } from "./aggregate";

type TimedValue = { timestamp: string; value: number };

export type DecayEvent = {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  streakLength: number;
  values: TimedValue[];
  isDecaying: boolean;
};

export type RecoveryEvent = {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  streakLength: number;
  values: TimedValue[];
  precededByDecay: boolean;
  isRecovering: boolean;
};

/**
 * Item 7 (Content/Traffic Decay): 3 consecutive real declines. 2 in a
 * row is ordinary day-to-day noise (one bad day, then a rebound isn't
 * "decay"); 3 is the smallest run that starts to look like a direction
 * rather than variance, while still being reachable soon after the cron
 * accumulates real history (needs >= 4 real values for that metric:
 * 1 baseline + 3 declining).
 */
export const DECAY_STREAK_THRESHOLD = 3;

/**
 * Item 8 (Recovery/Growth Events): 2 consecutive real improvements,
 * deliberately a shorter bar than decay. Once a metric is already
 * flagged as declining, a reversal is good news worth surfacing as soon
 * as it's more than a single-day blip — requiring users to wait as long
 * for "it's recovering" as they did for "it's declining" would delay
 * good news for no real benefit.
 */
export const RECOVERY_STREAK_THRESHOLD = 2;

function realValuesChronological(snapshots: AnalyticsSnapshot[], key: MetricKey): TimedValue[] {
  return sortChronological(snapshots)
    .filter((snapshot) => snapshot[key] !== null && snapshot[key] !== undefined)
    .map((snapshot) => ({ timestamp: snapshot.timestamp, value: snapshot[key] as number }));
}

/** The trailing run at the end of `values` where each step moves in `direction` (skips nothing — null days were already filtered out by the caller, so "consecutive" means consecutive *real* values). */
function trailingStreak(values: TimedValue[], direction: "down" | "up"): TimedValue[] {
  if (values.length === 0) return [];
  const streak = [values[values.length - 1]];
  for (let i = values.length - 2; i >= 0; i--) {
    const continues = direction === "down" ? values[i].value > values[i + 1].value : values[i].value < values[i + 1].value;
    if (!continues) break;
    streak.unshift(values[i]);
  }
  return streak;
}

/** Item 7: flags a metric as decaying once it has moved in its "bad" direction (down for higherIsBetter metrics, up for lowerIsBetter ones like position/issues) for DECAY_STREAK_THRESHOLD consecutive real values. */
export function detectDecay(snapshots: AnalyticsSnapshot[], metricKey: MetricKey): DecayEvent {
  const definition = METRICS.find((metric) => metric.key === metricKey);
  if (!definition) throw new Error(`Unknown metric: ${metricKey}`);

  const values = realValuesChronological(snapshots, metricKey);
  const badDirection: "down" | "up" = definition.higherIsBetter ? "down" : "up";
  const streak = trailingStreak(values, badDirection);
  // streak.length real values contain (streak.length - 1) consecutive declining transitions — DECAY_STREAK_THRESHOLD counts transitions, not points.
  const isDecaying = streak.length - 1 >= DECAY_STREAK_THRESHOLD;

  return { key: metricKey, label: definition.label, higherIsBetter: definition.higherIsBetter, streakLength: streak.length, values: streak, isDecaying };
}

export function detectAllDecayEvents(snapshots: AnalyticsSnapshot[]): DecayEvent[] {
  return METRICS.map((metric) => detectDecay(snapshots, metric.key)).filter((event) => event.isDecaying);
}

/** Item 8: flags a metric as recovering once it has moved in its "good" direction for RECOVERY_STREAK_THRESHOLD consecutive real values, *and* that upturn was immediately preceded by a real decay streak (otherwise it's just "growing", not "recovering"). */
export function detectRecovery(snapshots: AnalyticsSnapshot[], metricKey: MetricKey): RecoveryEvent {
  const definition = METRICS.find((metric) => metric.key === metricKey);
  if (!definition) throw new Error(`Unknown metric: ${metricKey}`);

  const values = realValuesChronological(snapshots, metricKey);
  const goodDirection: "down" | "up" = definition.higherIsBetter ? "up" : "down";
  const streak = trailingStreak(values, goodDirection);

  const streakStartIndex = values.length - streak.length;
  const priorValues = values.slice(0, streakStartIndex + 1); // include the pivot point the recovery turned from
  const badDirection: "down" | "up" = definition.higherIsBetter ? "down" : "up";
  const priorStreak = trailingStreak(priorValues, badDirection);
  const precededByDecay = priorStreak.length - 1 >= DECAY_STREAK_THRESHOLD;

  // like decay, RECOVERY_STREAK_THRESHOLD counts consecutive improving transitions, not points.
  const isRecovering = streak.length - 1 >= RECOVERY_STREAK_THRESHOLD && precededByDecay;

  return {
    key: metricKey,
    label: definition.label,
    higherIsBetter: definition.higherIsBetter,
    streakLength: streak.length,
    values: streak,
    precededByDecay,
    isRecovering,
  };
}

export function detectAllRecoveryEvents(snapshots: AnalyticsSnapshot[]): RecoveryEvent[] {
  return METRICS.map((metric) => detectRecovery(snapshots, metric.key)).filter((event) => event.isRecovering);
}
