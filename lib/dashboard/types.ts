export type DashboardIconName =
  | "dashboard"
  | "content"
  | "import"
  | "review"
  | "analytics"
  | "settings";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: DashboardIconName;
};
