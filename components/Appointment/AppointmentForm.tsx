"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type FormState = {
  name: string;
  age: string;
  phone: string;
  email: string;
  sessionType: "online" | "inPerson";
  visitorType: "child" | "teen" | "parent" | "adult";
  topic: string;
  referral: string;
  consent: boolean;
  // honeypot
  company: string;
};

const initialState: FormState = {
  name: "",
  age: "",
  phone: "",
  email: "",
  sessionType: "online",
  visitorType: "child",
  topic: "",
  referral: "",
  consent: false,
  company: "",
};

const phonePattern = /^0?9\d{9}$|^\+98\s?9\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<keyof FormState, string>>;

export default function AppointmentForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "لطفاً نام و نام خانوادگی را وارد کنید.";
    if (!form.age.trim()) next.age = "لطفاً سن را وارد کنید.";
    else if (Number.isNaN(Number(form.age)) || Number(form.age) <= 0) next.age = "سن معتبر نیست.";
    if (!form.phone.trim()) next.phone = "لطفاً شماره تماس را وارد کنید.";
    else if (!phonePattern.test(form.phone.trim())) next.phone = "شماره تماس معتبر نیست.";
    if (form.email.trim() && !emailPattern.test(form.email.trim())) next.email = "ایمیل معتبر نیست.";
    if (!form.topic.trim()) next.topic = "لطفاً موضوع اصلی مراجعه را بنویسید.";
    if (!form.consent) next.consent = "برای ارسال درخواست باید این مورد را تأیید کنید.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("request-failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-note" role="status">
        <div>
          <p style={{ color: "var(--primary)", fontWeight: 500, marginBottom: ".6rem" }}>
            درخواست شما ثبت شد.
          </p>
          <p style={{ color: "var(--text)", lineHeight: 1.9 }}>
            در اولین فرصت برای هماهنگی جلسه با شما تماس گرفته خواهد شد.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="stack-lg" onSubmit={handleSubmit} noValidate>
      {/* honeypot field — hidden from real users */}
      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="company">شرکت</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(event) => update("company", event.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="name">
            نام و نام خانوادگی *
          </label>
          <input
            id="name"
            className="field-input"
            type="text"
            autoComplete="name"
            value={form.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
          />
          {errors.name && (
            <p id="name-error" className="field-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="age">
            سن *
          </label>
          <input
            id="age"
            className="field-input"
            type="number"
            min={0}
            value={form.age}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? "age-error" : undefined}
            onChange={(event) => update("age", event.target.value)}
          />
          {errors.age && (
            <p id="age-error" className="field-error">
              {errors.age}
            </p>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="phone">
            شماره تماس *
          </label>
          <input
            id="phone"
            className="field-input"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            onChange={(event) => update("phone", event.target.value)}
          />
          {errors.phone && (
            <p id="phone-error" className="field-error">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="email">
            ایمیل (اختیاری)
          </label>
          <input
            id="email"
            className="field-input"
            type="email"
            autoComplete="email"
            value={form.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(event) => update("email", event.target.value)}
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset style={{ border: "none", padding: 0, display: "grid", gap: ".8rem" }}>
        <legend className="field-label" style={{ padding: 0, marginBottom: ".4rem" }}>
          نوع جلسه *
        </legend>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="sessionType"
              checked={form.sessionType === "online"}
              onChange={() => update("sessionType", "online")}
            />
            آنلاین
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="sessionType"
              checked={form.sessionType === "inPerson"}
              onChange={() => update("sessionType", "inPerson")}
            />
            حضوری
          </label>
        </div>
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, display: "grid", gap: ".8rem" }}>
        <legend className="field-label" style={{ padding: 0, marginBottom: ".4rem" }}>
          نوع مراجعه *
        </legend>
        <div className="radio-group">
          {(
            [
              ["child", "کودک"],
              ["teen", "نوجوان"],
              ["parent", "والدین"],
              ["adult", "بزرگسال"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="radio-option">
              <input
                type="radio"
                name="visitorType"
                checked={form.visitorType === value}
                onChange={() => update("visitorType", value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="topic">
          موضوع اصلی مراجعه *
        </label>
        <textarea
          id="topic"
          className="field-textarea"
          rows={5}
          value={form.topic}
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={errors.topic ? "topic-error" : undefined}
          onChange={(event) => update("topic", event.target.value)}
        />
        {errors.topic && (
          <p id="topic-error" className="field-error">
            {errors.topic}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="referral">
          چگونه با من آشنا شدید؟ (اختیاری)
        </label>
        <input
          id="referral"
          className="field-input"
          type="text"
          value={form.referral}
          onChange={(event) => update("referral", event.target.value)}
        />
      </div>

      <label className="consent-row" htmlFor="consent">
        <input
          id="consent"
          type="checkbox"
          checked={form.consent}
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          onChange={(event) => update("consent", event.target.checked)}
        />
        <span>اطلاعات وارد شده را صحیح می‌دانم و با استفاده از آن برای هماهنگی جلسه موافقم.</span>
      </label>
      {errors.consent && (
        <p id="consent-error" className="field-error">
          {errors.consent}
        </p>
      )}

      {status === "error" && (
        <p className="field-error">
          ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.
        </p>
      )}

      <button
        type="submit"
        className="button button-primary"
        style={{ width: "fit-content" }}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "در حال ارسال..." : "ارسال درخواست"}
      </button>

      <p className="caption">
        اطلاعات شما صرفاً برای هماهنگی جلسات درمانی استفاده می‌شود و محرمانه خواهد ماند.{" "}
        <Link href="/privacy">مشاهده سیاست حریم خصوصی</Link>
      </p>
    </form>
  );
}
