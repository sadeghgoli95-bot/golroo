"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="contact-note" role="status">
        <p style={{ color: "var(--text)", lineHeight: 1.9 }}>
          درخواست شما ثبت شد. برای هماهنگی جلسه در اسرع وقت با شما تماس گرفته می‌شود.
        </p>
      </div>
    );
  }

  return (
    <form className="stack-lg" onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="name">
            نام و نام خانوادگی
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="field-input"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="phone">
            شماره تماس
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="field-input"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="email">
            ایمیل (اختیاری)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="field-input"
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="sessionType">
            نوع جلسه
          </label>
          <select id="sessionType" name="sessionType" className="field-select" defaultValue="online">
            <option value="online">جلسه آنلاین</option>
            <option value="inPerson">جلسه حضوری</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="topic">
          موضوع
        </label>
        <textarea id="topic" name="topic" className="field-textarea" rows={5} />
      </div>

      <button type="submit" className="button button-primary" style={{ width: "fit-content" }}>
        ارسال درخواست
      </button>
    </form>
  );
}
