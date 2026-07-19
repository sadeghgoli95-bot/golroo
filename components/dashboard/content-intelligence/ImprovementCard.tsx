import type { Improvement } from "@/lib/content-intelligence/types";

type ImprovementCardProps = {
  improvement: Improvement;
};

export default function ImprovementCard({ improvement }: ImprovementCardProps) {
  return (
    <div className={`dashboard-priority-item dashboard-priority-${improvement.priority}`}>
      {improvement.message}
    </div>
  );
}
