"use client";

import { useState, useTransition } from "react";
import type { Article } from "@/lib/article/types";
import {
  saveEditsAction,
  reviewDecisionAction,
  type EditableFields,
  type ReviewDecisionType,
} from "@/app/dashboard/content/review/[slug]/actions";
import type { ReviewAnalysis } from "@/app/dashboard/content/review/[slug]/reviewAnalysis";
import ReviewReport from "./ReviewReport";

type ReviewWorkspaceProps = {
  slug: string;
  article: Article;
  analysis: ReviewAnalysis;
};

function toFields(article: Article): EditableFields {
  return {
    title: article.title ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    metaDescription: article.metaDescription ?? "",
    keywords: article.keywords.join("، "),
    body: article.body ?? "",
  };
}

const DECISION_LABEL: Record<ReviewDecisionType, string> = {
  approve: "تأیید",
  reject: "رد",
  request_changes: "درخواست اصلاح",
};

export default function ReviewWorkspace({ slug, article, analysis }: ReviewWorkspaceProps) {
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [fields, setFields] = useState(toFields(article));
  const [currentAnalysis, setCurrentAnalysis] = useState(analysis);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeciding, startDeciding] = useTransition();

  const handleField = (key: keyof EditableFields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((previous) => ({ ...previous, [key]: event.target.value }));
  };

  const handleSave = () => {
    setSaveMessage(null);
    startSaving(async () => {
      const response = await saveEditsAction(currentSlug, fields);
      if (response.ok) {
        setCurrentAnalysis(response.analysis);
        setCurrentSlug(response.article.slug ?? currentSlug);
        setSaveMessage("ذخیره شد و تحلیل به‌روزرسانی شد.");
      } else {
        setSaveMessage(response.message);
      }
    });
  };

  const handleDecision = (decision: ReviewDecisionType) => {
    setDecisionMessage(null);
    startDeciding(async () => {
      const response = await reviewDecisionAction(currentSlug, decision, decisionNote);
      setDecisionMessage(
        response.ok
          ? `${DECISION_LABEL[decision]} ثبت شد (ذخیره دائمی نمی‌شود).`
          : response.message
      );
    });
  };

  return (
    <>
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">ویرایش دستی</h2>
        <div className="dashboard-import">
          <input className="dashboard-textarea" value={fields.title} onChange={handleField("title")} placeholder="عنوان" />
          <input className="dashboard-textarea" value={fields.slug} onChange={handleField("slug")} placeholder="Slug" />
          <input
            className="dashboard-textarea"
            value={fields.excerpt}
            onChange={handleField("excerpt")}
            placeholder="خلاصه"
          />
          <input
            className="dashboard-textarea"
            value={fields.metaDescription}
            onChange={handleField("metaDescription")}
            placeholder="Meta Description"
          />
          <input
            className="dashboard-textarea"
            value={fields.keywords}
            onChange={handleField("keywords")}
            placeholder="کلیدواژه‌ها (با ، جدا شود)"
          />
          <textarea className="dashboard-textarea" rows={16} value={fields.body} onChange={handleField("body")} placeholder="متن مقاله" />
          <button type="button" className="dashboard-button" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "در حال ذخیره..." : "ذخیره و تحلیل مجدد"}
          </button>
          {saveMessage ? <p>{saveMessage}</p> : null}
        </div>
      </section>

      <ReviewReport analysis={currentAnalysis} />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تصمیم بازبینی</h2>
        <div className="dashboard-import">
          <input
            className="dashboard-textarea"
            value={decisionNote}
            onChange={(event) => setDecisionNote(event.target.value)}
            placeholder="یادداشت (اختیاری)"
          />
          <div className="dashboard-button-row">
            <button type="button" className="dashboard-button" disabled={isDeciding} onClick={() => handleDecision("approve")}>
              تأیید
            </button>
            <button type="button" className="dashboard-button" disabled={isDeciding} onClick={() => handleDecision("reject")}>
              رد
            </button>
            <button
              type="button"
              className="dashboard-button"
              disabled={isDeciding}
              onClick={() => handleDecision("request_changes")}
            >
              درخواست اصلاح
            </button>
          </div>
          {decisionMessage ? <p>{decisionMessage}</p> : null}
        </div>
      </section>
    </>
  );
}
