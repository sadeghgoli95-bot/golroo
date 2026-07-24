import type { MetricValue } from "../types";

export type LandingPageMetric = {
  path: string;
  sessions: number;
  users: number;
};

export type TrafficSourceMetric = {
  source: string;
  sessions: number;
  users: number;
};

export type DeviceMetric = {
  device: string;
  sessions: number;
  users: number;
};

export type CountryMetric = {
  country: string;
  sessions: number;
  users: number;
};

export type TrafficMetrics = {
  users: MetricValue;
  sessions: MetricValue;
  engagedSessions: MetricValue;
  pageViews: MetricValue;
  uniqueVisitors: MetricValue;
  returningVisitors: MetricValue;
  newUsers: MetricValue;
  averageSessionDuration: MetricValue;
  bounceRate: MetricValue;
  engagementRate: MetricValue;
  pagesPerSession: MetricValue;
  landingPages: LandingPageMetric[];
  trafficSources: TrafficSourceMetric[];
  devices: DeviceMetric[];
  countries: CountryMetric[];
};
