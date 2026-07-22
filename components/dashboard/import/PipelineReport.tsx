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
  const {
    article,
    validation,
    seo,
    aeo,
    geo,
    ai,
    links,
    duplicates,
    publishReadiness,
    executiveSummary,
    structuredData,
    aiOverviewSummary,
    metaTags,
    featuredSnippets,
    contentQuality,
  } = result;

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
        <h2 className="dashboard-section-title">مشاور کیفیت محتوا (Content Quality Advisor)</h2>
        <div className="dashboard-score-badge-row">
          <ScoreBadge label="محتوا" value={contentQuality.scores.content} />
          <ScoreBadge label="خوانایی" value={contentQuality.scores.readability} />
          <ScoreBadge label="پوشش موضوعی" value={contentQuality.scores.topicCoverage} />
          <ScoreBadge label="شواهد علمی" value={contentQuality.scores.evidence} />
          <ScoreBadge label="کیفیت تیترها" value={contentQuality.scores.headingQuality} />
          <ScoreBadge label="عمق محتوا" value={contentQuality.scores.contentDepth} />
        </div>
        <ul className="dashboard-insights-list">
          <li className="dashboard-insight">
            قصد جستجو: {contentQuality.searchIntent.intent} ({contentQuality.searchIntent.signals.join("، ")})
          </li>
          <li className={`dashboard-insight ${contentQuality.voiceSearchReady ? "dashboard-insight-positive" : "dashboard-insight-warning"}`}>
            جستجوی صوتی: {contentQuality.voiceSearchReady ? "آماده ✓" : "نیازمند بهبود"}
          </li>
          <li className={`dashboard-insight ${contentQuality.aiOverviewReady ? "dashboard-insight-positive" : "dashboard-insight-warning"}`}>
            AI Overview: {contentQuality.aiOverviewReady ? "آماده ✓" : "نیازمند بهبود"}
          </li>
          <li className={`dashboard-insight ${contentQuality.featuredSnippetReady ? "dashboard-insight-positive" : "dashboard-insight-warning"}`}>
            Featured Snippet: {contentQuality.featuredSnippetReady ? "آماده ✓" : "نیازمند بهبود"}
          </li>
          <li className="dashboard-insight">
            پوشش موجودیت‌ها (Entity Coverage): {contentQuality.scores.entityCoverage ?? "غیرقابل‌دسترس (نیازمند Provider هوش مصنوعی)"}
          </li>
        </ul>

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

      {article.headings.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">فهرست مطالب (Table of Contents)</h2>
          <ul className="dashboard-insights-list">
            {article.headings.map((heading) => (
              <li key={heading.slug} className="dashboard-insight" style={{ paddingRight: `${heading.level * 12}px` }}>
                H{heading.level} — {heading.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.faq.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">سوالات متداول (FAQ)</h2>
          <ul className="dashboard-insights-list">
            {article.faq.map((item) => (
              <li key={item.question} className="dashboard-insight">
                {item.question} — {item.answer}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {aiOverviewSummary ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">خلاصه AI Overview</h2>
          <p>{aiOverviewSummary}</p>
        </section>
      ) : null}

      {featuredSnippets.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">کاندیدهای Featured Snippet</h2>
          <ul className="dashboard-insights-list">
            {featuredSnippets.map((candidate) => (
              <li key={candidate.question} className="dashboard-insight">
                <strong>{candidate.question}</strong> — {candidate.answer}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Open Graph / Twitter Card</h2>
        <ul className="dashboard-insights-list">
          <li className="dashboard-insight">نویسنده: {article.authorName}</li>
          <li className="dashboard-insight">عنوان: {metaTags.title ?? "—"}</li>
          <li className="dashboard-insight">توضیحات: {metaTags.description ?? "—"}</li>
          <li className="dashboard-insight">Canonical: {article.canonicalUrl ?? "—"}</li>
          <li className="dashboard-insight">
            Robots: {metaTags.robots.index ? "index" : "noindex"}, {metaTags.robots.follow ? "follow" : "nofollow"}
          </li>
        </ul>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">داده ساختاریافته (JSON-LD)</h2>
        <p>Canonical URL: {article.canonicalUrl ?? "—"}</p>
        <pre className="dashboard-textarea">{JSON.stringify(structuredData, null, 2)}</pre>
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
