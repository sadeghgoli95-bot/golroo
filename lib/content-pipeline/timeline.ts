import type { TimelineEvent, TimelineEventType } from "./types";

export function createTimelineEvent(type: TimelineEventType, note: string | null = null): TimelineEvent {
  return { type, at: new Date().toISOString(), note };
}

export function appendTimelineEvent(timeline: TimelineEvent[], event: TimelineEvent): TimelineEvent[] {
  return [...timeline, event];
}
