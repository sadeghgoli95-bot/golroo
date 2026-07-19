import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "میرورا",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
