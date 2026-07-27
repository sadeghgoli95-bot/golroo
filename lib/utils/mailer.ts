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
      ? `<tr style="border-bottom: 1px solid #EDE9E3;"><td style="padding: 12px 0; color: #7C7380; width: 140px;">${label}:</td><td style="padding: 12px 0;">${value}</td></tr>`
      : "";

  // Golroo brand palette (locked): #4B245F primary, #FFFFFF white, #24152B
  // dark plum, #C9C1B5 neutral. Hardcoded (not CSS variables) since email
  // clients don't reliably support them; #EDE9E3/#7C7380/#F5F1EA below are
  // documented derivations (light tints/mixes) of the locked neutral/dark
  // plum, not invented colors.
  return `
    <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FFFFFF; color: #24152B;">
      <h2 style="color: #4B245F; border-bottom: 1px solid #C9C1B5; padding-bottom: 16px;">
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
      <div style="margin-top: 32px; padding: 16px; background: #F5F1EA; border-right: 3px solid #4B245F;">
        <p style="margin: 0; color: #7C7380; font-size: 14px;">
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
