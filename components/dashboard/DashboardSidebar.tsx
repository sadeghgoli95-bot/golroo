"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { dashboardNavigation } from "@/lib/dashboard/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/dashboard/auth/logout", { method: "POST" });
    router.replace("/dashboard/login");
    router.refresh();
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-brand">گل‌رو</div>
      <nav className="dashboard-sidebar-nav">
        {dashboardNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-sidebar-link${isActive ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button type="button" onClick={handleLogout} className="dashboard-sidebar-logout">
        خروج
      </button>
    </aside>
  );
}
