export type DashboardIconName =
  | "dashboard"
  | "content"
  | "seo"
  | "health"
  | "reports"
  | "settings";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: DashboardIconName;
};
