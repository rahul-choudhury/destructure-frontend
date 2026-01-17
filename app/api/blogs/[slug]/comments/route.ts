import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { ApiResponse, Comment } from "@/lib/definitions";
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

  const response = await fetch(`${API_URL}/api/blogs/${slug}/comments`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(errorData, { status: response.status });
  }

  const data: ApiResponse<Comment[]> = await response.json();

  return NextResponse.json({
    ...data,
    isAuthenticated: !!token,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { isSuccess: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { slug } = await context.params;
  const body = await request.json();

  const response = await fetch(`${API_URL}/api/blogs/${slug}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
