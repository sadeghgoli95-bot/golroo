type WarningCardProps = {
  message: string;
};

export default function WarningCard({ message }: WarningCardProps) {
  return <div className="dashboard-priority-item dashboard-priority-high">{message}</div>;
}
