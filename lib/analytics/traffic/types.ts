import type { MetricValue } from "../types";

export type TrafficMetrics = {
  users: MetricValue;
  sessions: MetricValue;
  pageViews: MetricValue;
  uniqueVisitors: MetricValue;
  returningVisitors: MetricValue;
  newUsers: MetricValue;
  averageSessionDuration: MetricValue;
  bounceRate: MetricValue;
  engagementRate: MetricValue;
  pagesPerSession: MetricValue;
};
