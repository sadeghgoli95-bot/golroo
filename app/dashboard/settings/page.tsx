import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getSystemStatus } from "@/lib/dashboard/getSystemStatus";

export default function SettingsPage() {
  const status = getSystemStatus();

  return (
    <>
      <DashboardHeader title="تنظیمات" description="وضعیت اتصال سرویس‌ها" />
      <ul className="dashboard-insights-list">
        {status.map((item) => (
          <li
            key={item.label}
            className={`dashboard-insight ${
              item.status === "connected" ? "dashboard-insight-positive" : "dashboard-insight-warning"
            }`}
          >
            {item.label} — {item.status === "connected" ? "متصل" : "پیکربندی نشده"} ({item.detail})
          </li>
        ))}
      </ul>
    </>
  );
}
