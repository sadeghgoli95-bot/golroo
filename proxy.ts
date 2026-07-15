import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Powered-By", "Golroo");
  return response;
}