import nodemailer from "nodemailer";

// SMTP credentials are supplied later via environment variables — see
// .env.local. Nothing here is hardcoded.
export function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not configured.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export type AppointmentEmailPayload = {
  name: string;
  age: string;
  phone: string;
  email: string;
  sessionType: string;
  visitorType: string;
  topic: string;
  referral: string;
  submittedAt: string;
  ip?: string;
};

const sessionTypeLabels: Record<string, string> = {
  online: "آنلاین",
  inPerson: "حضوری",
};

const visitorTypeLabels: Record<string, string> = {
  child: "کودک",
  teen: "نوجوان",
  parent: "والدین",
  adult: "بزرگسال",
};

export function renderAppointmentEmailHtml(payload: AppointmentEmailPayload): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:8px 12px;color:#8C857D;">${label}</td><td style="padding:8px 12px;color:#1A1714;">${value}</td></tr>`
      : "";

  return `
    <div dir="rtl" style="font-family:sans-serif;background:#F7F3EE;padding:32px;">
      <h2 style="color:#6B2D3E;">درخواست جلسه جدید</h2>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(26,23,20,.1);border-radius:8px;">
        ${row("نام", payload.name)}
        ${row("سن", payload.age)}
        ${row("شماره تماس", payload.phone)}
        ${row("ایمیل", payload.email)}
        ${row("نوع جلسه", sessionTypeLabels[payload.sessionType] || payload.sessionType)}
        ${row("نوع مراجعه", visitorTypeLabels[payload.visitorType] || payload.visitorType)}
        ${row("موضوع مراجعه", payload.topic)}
        ${row("زمان ثبت درخواست", payload.submittedAt)}
        ${payload.ip ? row("IP", payload.ip) : ""}
      </table>
    </div>
  `;
}

export async function sendAppointmentEmail(payload: AppointmentEmailPayload) {
  const transport = getTransport();
  const recipient = process.env.APPOINTMENT_NOTIFICATION_EMAIL;

  if (!recipient) {
    throw new Error("APPOINTMENT_NOTIFICATION_EMAIL is not configured.");
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: "درخواست جلسه جدید",
    html: renderAppointmentEmailHtml(payload),
  });
}
