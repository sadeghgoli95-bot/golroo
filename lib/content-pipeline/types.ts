export type ArticleStateId =
  | "idea"
  | "research"
  | "writing"
  | "imported"
  | "parsed"
  | "analyzed"
  | "seo_optimized"
  | "aeo_optimized"
  | "geo_optimized"
  | "scientific_review"
  | "human_review"
  | "approved"
  | "scheduled"
  | "published"
  | "updated"
  | "needs_refresh"
  | "archived"
  | "canceled";

export type ArticleState = {
  id: ArticleStateId;
  name: string;
  description: string;
  allowedTransitions: ArticleStateId[];
  color: string;
  icon: string;
};

export type TimelineEventType =
  | "created"
  | "imported"
  | "edited"
  | "analyzed"
  | "approved"
  | "published"
  | "updated"
  | "archived";

export type TimelineEvent = {
  type: TimelineEventType;
  at: string;
  note: string | null;
};

export type ValidationIssue = {
  code: string;
  message: string;
};

export type ValidationReport = {
  passed: boolean;
  issues: ValidationIssue[];
};
