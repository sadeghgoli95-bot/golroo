import type { DashboardNavItem } from "./types";

/**
 * The Analytics Dashboard's only navigation — article import/review are
 * intentionally not linked here anymore (see app/dashboard/content/import
 * and app/dashboard/content/review, still present and working at their
 * URLs, just no longer part of the dashboard's primary workflow).
 */
export const dashboardNavigation: DashboardNavItem[] = [
  { label: "نمای کلی", href: "/dashboard", icon: "dashboard" },
  { label: "مرکز فرماندهی", href: "/dashboard/command-center", icon: "command-center" },
  { label: "تحلیل محتوا", href: "/dashboard/content-analytics", icon: "content" },
  { label: "سئو", href: "/dashboard/seo", icon: "seo" },
  { label: "هوش جستجو", href: "/dashboard/search-intelligence", icon: "search" },
  { label: "رشد", href: "/dashboard/growth", icon: "growth" },
  { label: "تبدیل و هوش تجاری", href: "/dashboard/conversions", icon: "conversion" },
  { label: "سلامت سایت", href: "/dashboard/site-health", icon: "health" },
  { label: "تاریخچه", href: "/dashboard/history", icon: "history" },
  { label: "هوش تحلیلی تاریخچه", href: "/dashboard/history/insights", icon: "history" },
  { label: "گزارش‌ها", href: "/dashboard/reports", icon: "reports" },
  { label: "تنظیمات", href: "/dashboard/settings", icon: "settings" },
];
