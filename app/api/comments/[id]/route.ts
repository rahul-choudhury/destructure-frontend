import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { getTokenFromCookie } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { isSuccess: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const body = await request.json();

  const response = await fetch(`${API_URL}/api/comments/${id}`, {
    method: "PATCH",
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { isSuccess: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const response = await fetch(`${API_URL}/api/comments/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
