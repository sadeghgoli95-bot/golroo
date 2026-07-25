import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DASHBOARD_SESSION_COOKIE, isValidSessionToken } from "@/lib/dashboard/auth";

const DASHBOARD_LOGIN_PATH = "/dashboard/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && pathname !== DASHBOARD_LOGIN_PATH) {
    const token = request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value;
    const authorized = await isValidSessionToken(token);
    if (!authorized) {
      const loginUrl = new URL(DASHBOARD_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Powered-By", "Golroo");
  return response;
}