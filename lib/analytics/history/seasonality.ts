import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { average } from "./aggregate";

/** getUTCDay(): 0 = Sunday ... 6 = Saturday. */
const DAY_LABELS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];

export type DayOfWeekAverage = {
  dayIndex: number;
  dayLabel: string;
  average: number | null;
  sampleCount: number;
};

export type SeasonalPattern = {
  key: MetricKey;
  label: string;
  sufficient: boolean;
  minWeeksRequired: number;
  weeksCovered: number;
  days: DayOfWeekAverage[];
};

/**
 * One occurrence of each weekday is one data point per day, not a
 * "pattern" — it can't distinguish a real weekly rhythm from one
 * unusual day. 2 distinct ISO weeks is the minimum needed to see if a
 * weekday is *consistently* higher or lower rather than a one-off.
 */
const MIN_WEEKS_REQUIRED = 2;

function isoWeekStartKey(date: Date): string {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const isoDayOfWeek = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - isoDayOfWeek);
  return day.toISOString().slice(0, 10);
}

/**
 * Item 6: day-of-week averaging over real snapshots. Declared
 * `sufficient` only once real history spans at least MIN_WEEKS_REQUIRED
 * distinct weeks; below that, degrades to an honest insufficient-data
 * result instead of presenting a single day's value as a pattern.
 */
export function detectSeasonalPattern(snapshots: AnalyticsSnapshot[], metricKey: MetricKey): SeasonalPattern {
  const definition = METRICS.find((metric) => metric.key === metricKey);
  if (!definition) throw new Error(`Unknown metric: ${metricKey}`);

  const byDay = new Map<number, number[]>();
  const weekKeys = new Set<string>();

  for (const snapshot of snapshots) {
    const date = new Date(snapshot.timestamp);
    weekKeys.add(isoWeekStartKey(date));

    const value = snapshot[metricKey];
    if (value === null || value === undefined) continue;

    const dayIndex = date.getUTCDay();
    const list = byDay.get(dayIndex) ?? [];
    list.push(value);
    byDay.set(dayIndex, list);
  }

  const weeksCovered = weekKeys.size;
  const sufficient = weeksCovered >= MIN_WEEKS_REQUIRED;

  const days: DayOfWeekAverage[] = Array.from({ length: 7 }, (_, dayIndex) => {
    const values = byDay.get(dayIndex) ?? [];
    return { dayIndex, dayLabel: DAY_LABELS[dayIndex], average: average(values), sampleCount: values.length };
  });

  return { key: metricKey, label: definition.label, sufficient, minWeeksRequired: MIN_WEEKS_REQUIRED, weeksCovered, days };
}

export function detectAllSeasonalPatterns(snapshots: AnalyticsSnapshot[]): SeasonalPattern[] {
  return METRICS.map((metric) => detectSeasonalPattern(snapshots, metric.key));
}
