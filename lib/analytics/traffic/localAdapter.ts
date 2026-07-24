import { createLocalAdapter } from "../localAdapter";
import type { TrafficMetrics } from "./types";

const EMPTY_METRIC = { current: 0, previousPeriod: null, previousYear: null };

const EMPTY_TRAFFIC_METRICS: TrafficMetrics = {
  users: EMPTY_METRIC,
  sessions: EMPTY_METRIC,
  engagedSessions: EMPTY_METRIC,
  pageViews: EMPTY_METRIC,
  uniqueVisitors: EMPTY_METRIC,
  returningVisitors: EMPTY_METRIC,
  newUsers: EMPTY_METRIC,
  averageSessionDuration: EMPTY_METRIC,
  bounceRate: EMPTY_METRIC,
  engagementRate: EMPTY_METRIC,
  pagesPerSession: EMPTY_METRIC,
  landingPages: [],
  trafficSources: [],
  devices: [],
  countries: [],
};

export const trafficLocalAdapter = createLocalAdapter<TrafficMetrics>(EMPTY_TRAFFIC_METRICS);
