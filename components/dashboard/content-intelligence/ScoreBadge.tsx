type ScoreBadgeProps = {
  label: string;
  value: number;
};

export default function ScoreBadge({ label, value }: ScoreBadgeProps) {
  return (
    <span className="dashboard-score-badge">
      <span className="dashboard-score-badge-label">{label}</span>
      <span className="dashboard-score-badge-value">{value}</span>
    </span>
  );
}
