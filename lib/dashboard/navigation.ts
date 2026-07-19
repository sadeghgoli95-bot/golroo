import type { DashboardNavItem } from "./types";

export const dashboardNavigation: DashboardNavItem[] = [
  { label: "داشبورد", href: "/dashboard", icon: "dashboard" },
  { label: "محتوا", href: "/dashboard/content", icon: "content" },
  { label: "ورود مقاله", href: "/dashboard/content/import", icon: "import" },
  { label: "بازبینی", href: "/dashboard/content/review", icon: "review" },
  { label: "تحلیل‌ها", href: "/dashboard/content/analytics", icon: "analytics" },
  { label: "تنظیمات", href: "/dashboard/content/settings", icon: "settings" },
];
