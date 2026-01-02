import { NextRequest, NextResponse } from "next/server";

import { getTokenFromCookie } from "./lib/utils.server";

export async function proxy(request: NextRequest) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
