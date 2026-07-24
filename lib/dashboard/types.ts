export type DashboardIconName =
  | "dashboard"
  | "content"
  | "seo"
  | "health"
  | "reports"
  | "settings"
  | "search"
  | "growth"
  | "conversion"
  | "history"
  | "command-center";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: DashboardIconName;
};
