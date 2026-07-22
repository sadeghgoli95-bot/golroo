import type { ReviewAnalysis } from "@/app/dashboard/content/review/[slug]/reviewAnalysis";
import ScoreBadge from "@/components/dashboard/content-intelligence/ScoreBadge";

const READINESS_LABEL: Record<ReviewAnalysis["publishReadiness"]["status"], string> = {
  ready: "آماده انتشار",
  almost_ready: "تقریباً آماده",
  blocked: "مسدود شده",
};

const READINESS_CLASS: Record<ReviewAnalysis["publishReadiness"]["status"], string> = {
  ready: "dashboard-insight-positive",
  almost_ready: "dashboard-insight-warning",
  blocked: "dashboard-insight-critical",
};

type ReviewReportProps = {
  analysis: ReviewAnalysis;
};

export default function ReviewReport({ analysis }: ReviewReportProps) {
  const { validation, seo, aeo, geo, links, duplicates, publishReadiness, contentQuality } = analysis;

  return (
    <>
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
        <h2 className="dashboard-section-title">مشاور کیفیت محتوا (Content Quality Advisor)</h2>
        <div className="dashboard-score-badge-row">
          <ScoreBadge label="محتوا" value={contentQuality.scores.content} />
          <ScoreBadge label="خوانایی" value={contentQuality.scores.readability} />
          <ScoreBadge label="پوشش موضوعی" value={contentQuality.scores.topicCoverage} />
          <ScoreBadge label="شواهد علمی" value={contentQuality.scores.evidence} />
          <ScoreBadge label="کیفیت تیترها" value={contentQuality.scores.headingQuality} />
          <ScoreBadge label="عمق محتوا" value={contentQuality.scores.contentDepth} />
        </div>

        {contentQuality.suggestions.critical.length > 0 ? (
          <>
            <h3>حیاتی</h3>
            <ul className="dashboard-insights-list">
              {contentQuality.suggestions.critical.map((item) => (
                <li key={item} className="dashboard-insight dashboard-insight-critical">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {contentQuality.suggestions.recommended.length > 0 ? (
          <>
            <h3>پیشنهادی</h3>
            <ul className="dashboard-insights-list">
              {contentQuality.suggestions.recommended.map((item) => (
                <li key={item} className="dashboard-insight dashboard-insight-warning">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {contentQuality.suggestions.optional.length > 0 ? (
          <>
            <h3>اختیاری</h3>
            <ul className="dashboard-insights-list">
              {contentQuality.suggestions.optional.map((item) => (
                <li key={item} className="dashboard-insight">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {!validation.valid || validation.warnings.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">اعتبارسنجی</h2>
          <ul className="dashboard-insights-list">
            {validation.errors.map((message) => (
              <li key={message} className="dashboard-insight dashboard-insight-critical">
                {message}
              </li>
            ))}
            {validation.warnings.map((message) => (
              <li key={message} className="dashboard-insight dashboard-insight-warning">
                {message}
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
    </>
  );
}
