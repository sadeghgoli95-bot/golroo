import type { OverviewScores } from "@/lib/analytics/dashboard/types";
import DashboardCard from "@/components/dashboard/DashboardCard";

const SCORE_LABELS: { key: keyof OverviewScores; label: string }[] = [
  { key: "siteHealth", label: "سلامت سایت (Site Health)" },
  { key: "seo", label: "سئو (SEO)" },
  { key: "aeo", label: "موتورهای پاسخ (AEO)" },
  { key: "geo", label: "موتورهای هوش مصنوعی (GEO)" },
  { key: "performance", label: "عملکرد (Performance)" },
  { key: "content", label: "کیفیت محتوا (Content)" },
  { key: "visibility", label: "دیده‌شدن (Visibility)" },
];

type ScoreOverviewWidgetProps = {
  scores: OverviewScores;
};

export default function ScoreOverviewWidget({ scores }: ScoreOverviewWidgetProps) {
  return (
    <div className="dashboard-grid">
      {SCORE_LABELS.map(({ key, label }) => (
        <DashboardCard key={key} label={label} value={String(scores[key])} />
      ))}
    </div>
  );
}
