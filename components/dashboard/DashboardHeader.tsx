type DashboardHeaderProps = {
  title: string;
  description?: string;
};

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-header-title">{title}</h1>
      {description ? <p className="dashboard-header-description">{description}</p> : null}
    </header>
  );
}
