import type { PipelineResult } from "@/lib/content-pipeline/runContentPipeline";
import IntelligencePanel from "@/components/dashboard/content-intelligence/IntelligencePanel";
import ScoreBadge from "@/components/dashboard/content-intelligence/ScoreBadge";

const READINESS_LABEL: Record<PipelineResult["publishReadiness"]["status"], string> = {
  ready: "آماده انتشار",
  almost_ready: "تقریباً آماده",
  blocked: "مسدود شده",
};

const READINESS_CLASS: Record<PipelineResult["publishReadiness"]["status"], string> = {
  ready: "dashboard-insight-positive",
  almost_ready: "dashboard-insight-warning",
  blocked: "dashboard-insight-critical",
};

type PipelineReportProps = {
  result: PipelineResult;
};

export default function PipelineReport({ result }: PipelineReportProps) {
  const { validation, seo, aeo, geo, ai, links, duplicates, publishReadiness, executiveSummary } = result;

  return (
    <div>
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">آمادگی انتشار</h2>
        <ul className="dashboard-insights-list">
          <li className={`dashboard-insight ${READINESS_CLASS[publishReadiness.status]}`}>
            {READINESS_LABEL[publishReadiness.status]}
          </li>
          {publishReadiness.reasons.map((reason) => (
            <li key={reason} className="dashboard-insight dashboard-insight-warning">
              {reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">امتیازها</h2>
        <div className="dashboard-score-badge-row">
          <ScoreBadge label="SEO" value={seo.score} />
          <ScoreBadge label="AEO" value={aeo.score} />
          <ScoreBadge label="GEO" value={geo.score} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خلاصه اجرایی</h2>
        {executiveSummary.topProblems.length > 0 ? (
          <ul className="dashboard-insights-list">
            {executiveSummary.topProblems.map((problem) => (
              <li key={problem} className="dashboard-insight dashboard-insight-critical">
                {problem}
              </li>
            ))}
          </ul>
        ) : (
          <div className="dashboard-empty-state">
            <p>مشکلی یافت نشد.</p>
          </div>
        )}
        {executiveSummary.topOpportunities.length > 0 ? (
          <ul className="dashboard-insights-list">
            {executiveSummary.topOpportunities.map((opportunity) => (
              <li key={opportunity} className="dashboard-insight dashboard-insight-positive">
                {opportunity}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {validation.issues.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">اعتبارسنجی</h2>
          <ul className="dashboard-insights-list">
            {validation.issues.map((issue) => (
              <li key={issue.code + issue.message} className="dashboard-insight dashboard-insight-warning">
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {links.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">پیشنهاد لینک داخلی</h2>
          <ul className="dashboard-insights-list">
            {links.map((link) => (
              <li key={link.targetSlug} className="dashboard-insight">
                {link.targetTitle} — {link.reason} ({link.confidence}٪)
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {duplicates.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">احتمال محتوای تکراری</h2>
          <ul className="dashboard-insights-list">
            {duplicates.map((match) => (
              <li key={match.targetSlug + match.matchType} className="dashboard-insight dashboard-insight-critical">
                {match.targetTitle} — {match.matchType} ({match.confidence}٪)
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">هوش مصنوعی (AI)</h2>
        {result.aiConfigured ? (
          <IntelligencePanel report={ai} />
        ) : (
          <div className="dashboard-empty-state">
            <p>Provider هوش مصنوعی پیکربندی نشده است.</p>
          </div>
        )}
      </section>
    </div>
  );
}
