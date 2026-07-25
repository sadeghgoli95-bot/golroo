import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/utils/rateLimit";
import { createSessionToken, getDashboardPassword, DASHBOARD_SESSION_COOKIE } from "@/lib/dashboard/auth";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`dashboard-login:${ip}`)) {
    return NextResponse.json({ error: "too-many-requests" }, { status: 429 });
  }

  const configuredPassword = getDashboardPassword();
  if (!configuredPassword) {
    return NextResponse.json({ error: "dashboard-password-not-configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password !== configuredPassword) {
    return NextResponse.json({ error: "invalid-password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DASHBOARD_SESSION_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/dashboard",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
