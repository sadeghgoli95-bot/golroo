type DashboardCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export default function DashboardCard({ label, value, hint }: DashboardCardProps) {
  return (
    <div className="dashboard-card">
      <p className="dashboard-card-label">{label}</p>
      <p className="dashboard-card-value">{value}</p>
      {hint ? <p className="dashboard-card-hint">{hint}</p> : null}
    </div>
  );
}
