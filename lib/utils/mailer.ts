import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      ? `<tr style="border-bottom: 1px solid #E8E2D9;"><td style="padding: 12px 0; color: #7A7068; width: 140px;">${label}:</td><td style="padding: 12px 0;">${value}</td></tr>`
      : "";

  return `
    <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FEFEFC; color: #1A1714;">
      <h2 style="color: #B8860B; border-bottom: 1px solid #D4A76A; padding-bottom: 16px;">
        درخواست جلسه جدید
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
        ${row("نام", payload.name)}
        ${row("سن", payload.age)}
        ${row("شماره تماس", payload.phone)}
        ${row("ایمیل", payload.email || "وارد نشده")}
        ${row("نوع جلسه", sessionTypeLabels[payload.sessionType] || payload.sessionType)}
        ${row("نوع مراجعه", visitorTypeLabels[payload.visitorType] || payload.visitorType)}
        ${row("موضوع مراجعه", payload.topic)}
        ${payload.referral ? row("آشنایی از طریق", payload.referral) : ""}
        ${row("زمان ثبت درخواست", payload.submittedAt)}
        ${payload.ip ? row("IP", payload.ip) : ""}
      </table>
      <div style="margin-top: 32px; padding: 16px; background: #FFF8DC; border-right: 3px solid #B8860B;">
        <p style="margin: 0; color: #7A7068; font-size: 14px;">
          این ایمیل از طریق فرم درخواست جلسه سایت گل‌رو ارسال شده است.
        </p>
      </div>
    </div>
  `;
}

export async function sendAppointmentEmail(payload: AppointmentEmailPayload) {
  const recipient = process.env.APPOINTMENT_NOTIFICATION_EMAIL;

  if (!recipient) {
    throw new Error("APPOINTMENT_NOTIFICATION_EMAIL is not configured.");
  }

  await resend.emails.send({
    from: "Golroo <onboarding@resend.dev>",
    to: recipient,
    subject: `درخواست جلسه جدید از ${payload.name}`,
    html: renderAppointmentEmailHtml(payload),
  });
}
