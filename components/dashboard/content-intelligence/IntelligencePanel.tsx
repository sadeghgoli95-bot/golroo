import type { IntelligenceReport } from "@/lib/content-intelligence/types";
import ScoreBadge from "./ScoreBadge";
import SuggestionCard from "./SuggestionCard";
import ImprovementCard from "./ImprovementCard";
import WarningCard from "./WarningCard";

type IntelligencePanelProps = {
  report: IntelligenceReport;
};

export default function IntelligencePanel({ report }: IntelligencePanelProps) {
  const scoreEntries = Object.entries(report.scores);

  return (
    <div className="dashboard-intelligence-panel">
      {scoreEntries.length > 0 ? (
        <div className="dashboard-score-badge-row">
          {scoreEntries.map(([label, value]) => (
            <ScoreBadge key={label} label={label} value={value} />
          ))}
        </div>
      ) : null}

      {report.warnings.length > 0 ? (
        <div className="dashboard-priority-list">
          {report.warnings.map((warning) => (
            <WarningCard key={warning} message={warning} />
          ))}
        </div>
      ) : null}

      {report.suggestions.length > 0 ? (
        <div className="dashboard-priority-list">
          {report.suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p>پیشنهادی وجود ندارد.</p>
        </div>
      )}

      {report.improvements.length > 0 ? (
        <div className="dashboard-priority-list">
          {report.improvements.map((improvement) => (
            <ImprovementCard key={improvement.id} improvement={improvement} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
