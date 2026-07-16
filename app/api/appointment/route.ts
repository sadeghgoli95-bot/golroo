import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/utils/rateLimit";
import { sendAppointmentEmail } from "@/lib/utils/mailer";

const phonePattern = /^0?9\d{9}$|^\+98\s?9\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sessionTypes = new Set(["online", "inPerson"]);
const visitorTypes = new Set(["child", "teen", "parent", "adult"]);

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "too-many-requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid-json");
  }

  // Honeypot: bots fill every field, humans never see this one.
  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const age = typeof body.age === "string" ? body.age.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const sessionType = typeof body.sessionType === "string" ? body.sessionType : "";
  const visitorType = typeof body.visitorType === "string" ? body.visitorType : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const referral = typeof body.referral === "string" ? body.referral.trim() : "";
  const consent = body.consent === true;

  if (!name) return badRequest("missing-name");
  if (!age || Number.isNaN(Number(age)) || Number(age) <= 0) return badRequest("invalid-age");
  if (!phone || !phonePattern.test(phone)) return badRequest("invalid-phone");
  if (email && !emailPattern.test(email)) return badRequest("invalid-email");
  if (!sessionTypes.has(sessionType)) return badRequest("invalid-session-type");
  if (!visitorTypes.has(visitorType)) return badRequest("invalid-visitor-type");
  if (!topic) return badRequest("missing-topic");
  if (!consent) return badRequest("missing-consent");

  try {
    await sendAppointmentEmail({
      name,
      age,
      phone,
      email,
      sessionType,
      visitorType,
      topic,
      referral,
      submittedAt: new Date().toLocaleString("fa-IR"),
      ip,
    });
  } catch (error) {
    console.error("Failed to send appointment email", error);
    return NextResponse.json({ error: "email-failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
