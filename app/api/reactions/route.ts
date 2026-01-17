import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
import { ReactionType } from "@/lib/definitions";
import { getTokenFromCookie } from "@/lib/session";

type ReactionRequestBody = {
  identifier: string;
  to: "BLOG";
  reaction: ReactionType;
};

export async function POST(request: NextRequest) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { isSuccess: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body: ReactionRequestBody = await request.json();

  const response = await fetch(`${API_URL}/api/reactions`, {
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
