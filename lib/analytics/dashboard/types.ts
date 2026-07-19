export type WidgetId =
  | "score-overview"
  | "traffic-overview"
  | "search-overview"
  | "content-overview"
  | "insights"
  | "notifications";

export type WidgetDefinition = {
  id: WidgetId;
  title: string;
};

export type DashboardLayout = {
  widgets: WidgetDefinition[];
};

export type OverviewScores = {
  siteHealth: number;
  seo: number;
  aeo: number;
  geo: number;
  performance: number;
  content: number;
  visibility: number;
};
