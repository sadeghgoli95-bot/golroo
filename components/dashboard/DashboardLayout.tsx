"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  if (pathname === "/dashboard/login") {
    return <div className="dashboard-shell dashboard-shell--bare">{children}</div>;
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
