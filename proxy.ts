import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie } from "./lib/session";

export async function proxy(request: NextRequest) {
  const token = await getTokenFromCookie();

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
