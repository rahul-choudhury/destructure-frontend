import type { NextRequest } from "next/server";
import { api } from "@/lib/api-client";
import { getTokenFromCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = await getTokenFromCookie();
  if (!token) {
    return Response.json(
      { isSuccess: false, message: "Unauthorized", data: [] },
      { status: 401 },
    );
  }

  const type = request.nextUrl.searchParams.get("type") || "ALL";

  try {
    const res = await api.get<string[]>("/api/admin/media", {
      headers: { Authorization: `Bearer ${token}` },
      params: { type },
    });
    return Response.json(res);
  } catch (e) {
    return Response.json(
      {
        isSuccess: false,
        message: e instanceof Error ? e.message : "Failed to fetch media",
        data: [],
      },
      { status: 500 },
    );
  }
}
