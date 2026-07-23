import type { DashboardNavItem } from "./types";

/**
 * The Analytics Dashboard's only navigation — article import/review are
 * intentionally not linked here anymore (see app/dashboard/content/import
 * and app/dashboard/content/review, still present and working at their
 * URLs, just no longer part of the dashboard's primary workflow).
 */
export const dashboardNavigation: DashboardNavItem[] = [
  { label: "نمای کلی", href: "/dashboard", icon: "dashboard" },
  { label: "تحلیل محتوا", href: "/dashboard/content-analytics", icon: "content" },
  { label: "سئو", href: "/dashboard/seo", icon: "seo" },
  { label: "سلامت سایت", href: "/dashboard/site-health", icon: "health" },
  { label: "گزارش‌ها", href: "/dashboard/reports", icon: "reports" },
  { label: "تنظیمات", href: "/dashboard/settings", icon: "settings" },
];
