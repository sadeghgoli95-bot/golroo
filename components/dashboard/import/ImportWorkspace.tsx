"use client";

import { useState, useTransition } from "react";
import { analyzeArticleAction, saveDraftAction } from "@/app/dashboard/content/import/actions";
import type { PipelineResult } from "@/lib/content-pipeline/runContentPipeline";
import PipelineReport from "./PipelineReport";

export default function ImportWorkspace() {
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const handleAnalyze = () => {
    setError(null);
    setSaveMessage(null);
    startAnalyzing(async () => {
      const response = await analyzeArticleAction(rawText);
      if (response.ok) {
        setResult(response.result);
      } else {
        setResult(null);
        setError(response.message);
      }
    });
  };

  const handleApprove = () => {
    if (!result) return;
    setSaveMessage(null);
    startSaving(async () => {
      const response = await saveDraftAction(JSON.stringify(result.article));
      setSaveMessage(response.ok ? `پیش‌نویس ذخیره شد: ${response.slug}` : response.message);
    });
  };

  const canApprove = Boolean(result) && result?.publishReadiness.status !== "blocked";

  return (
    <>
      <div className="dashboard-import">
        <textarea
          className="dashboard-textarea"
          placeholder="متن مقاله را اینجا paste کنید..."
          rows={20}
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
        />
        <button
          type="button"
          className="dashboard-button"
          disabled={!rawText.trim() || isAnalyzing}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? "در حال تحلیل..." : "تحلیل (Analyze)"}
        </button>
      </div>

      {error ? (
        <div className="dashboard-empty-state">
          <p>{error}</p>
        </div>
      ) : null}

      {result ? (
        <>
          <PipelineReport result={result} />

          <section className="dashboard-section">
            <button
              type="button"
              className="dashboard-button"
              disabled={!canApprove || isSaving}
              onClick={handleApprove}
            >
              {isSaving ? "در حال ذخیره..." : "تأیید و ذخیره پیش‌نویس"}
            </button>
            {saveMessage ? <p>{saveMessage}</p> : null}
          </section>
        </>
      ) : null}
    </>
  );
}
