import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getSystemStatus } from "@/lib/dashboard/getSystemStatus";

export default async function SettingsPage() {
  const status = await getSystemStatus();

  return (
    <>
      <DashboardHeader title="تنظیمات" description="وضعیت اتصال سرویس‌ها (بررسی زنده، نه فقط وجود متغیر محیطی)" />
      <ul className="dashboard-insights-list">
        {status.map((item) => (
          <li
            key={item.label}
            className={`dashboard-insight ${
              item.status === "connected" ? "dashboard-insight-positive" : "dashboard-insight-warning"
            }`}
          >
            {item.label} — {item.status === "connected" ? "متصل" : "قطع"} ({item.detail})
            {item.lastSyncedAt ? ` — آخرین همگام‌سازی: ${new Date(item.lastSyncedAt).toLocaleString("fa-IR")}` : ""}
          </li>
        ))}
      </ul>
    </>
  );
}
