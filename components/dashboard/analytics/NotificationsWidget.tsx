import type { Notification } from "@/lib/analytics/types";

type NotificationsWidgetProps = {
  notifications: Notification[];
};

export default function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  if (notifications.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>اعلانی وجود ندارد.</p>
      </div>
    );
  }

  return (
    <ul className="dashboard-insights-list">
      {notifications.map((notification) => (
        <li key={notification.id} className={`dashboard-insight dashboard-insight-${notification.severity}`}>
          {notification.message}
        </li>
      ))}
    </ul>
  );
}
