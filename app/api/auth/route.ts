import { api } from "@/lib/api-client";
import { JWT_EXPIRY } from "@/lib/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import z from "zod";

const paramSchema = z.object({
  code: z.string(),
  scope: z.string(),
  authuser: z.string(),
  prompt: z.string(),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsedParams = paramSchema.safeParse(params);

  if (!parsedParams.success) {
    return Response.json(
      { success: false, message: "Invalid/missing params." },
      { status: 400 },
    );
  }

  const callbackCode = parsedParams.data.code;
  const cookieStore = await cookies();

  try {
    const res = await api.get<{ jwt: string }>(
      `/api/auth/google/callback?code=${callbackCode}`,
    );

    cookieStore.set({
      name: "token",
      value: res.data.jwt,
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + JWT_EXPIRY * 24 * 60 * 60 * 1000),
    });
  } catch (e) {
    if (e instanceof Error) {
      return Response.json(
        { success: false, message: e.message },
        { status: 500 },
      );
    }
    return Response.json(
      { success: false, message: "Login failed." },
      { status: 500 },
    );
  }

  redirect("/");
}
