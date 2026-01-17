import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { ApiResponse, ReactionsData } from "@/lib/definitions";
import { getTokenFromCookie } from "@/lib/session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const token = await getTokenFromCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/blogs/${slug}/reactions`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(errorData, { status: response.status });
  }

  const data: ApiResponse<ReactionsData> = await response.json();

  return NextResponse.json({
    ...data,
    isAuthenticated: !!token,
  });
}
