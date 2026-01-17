import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";

  if (redirectTo.startsWith("/admin")) {
    redirectTo = "/";
  }

  revalidatePath("/", "layout");

  const cookieStore = await cookies();
  cookieStore.delete("token");

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.headers.set("Cache-Control", "no-store");

  return response;
}
